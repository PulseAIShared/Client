import React, { useEffect, useMemo, useState } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature as topoToGeo } from 'topojson-client';
import { GeoInsight } from '@/types/api';

const WORLD_TOPOJSON = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface GeoMapProps {
  data?: GeoInsight[];
  isLoading?: boolean;
  error?: Error | null;
}

export const GeoMap: React.FC<GeoMapProps> = ({ data, isLoading, error }) => {
  const safeData = data ?? [];
  const [features, setFeatures] = useState<Feature[]>([]);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch(WORLD_TOPOJSON)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        try {
          const obj =
            json.objects?.countries ??
            json.objects?.countries110m ??
            json.objects?.ne_110m_admin_0_countries;
          if (!obj) {
            throw new Error('No country topology found');
          }
          const geoResult = topoToGeo(json as any, obj) as
            | FeatureCollection<Geometry, any>
            | Feature<Geometry, any>;
          const parsed: Feature[] =
            (geoResult as FeatureCollection<Geometry, any>)?.features ??
            (geoResult ? [geoResult as Feature<Geometry, any>] : []);
          setFeatures(parsed);
        } catch (err: any) {
          setGeoError(err?.message ?? 'Unable to parse map data');
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setGeoError(err?.message ?? 'Unable to load map data');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const countryAliases: Record<string, string> = {
    usa: 'united states of america',
    'united states': 'united states of america',
    uk: 'united kingdom',
    'great britain': 'united kingdom',
    uae: 'united arab emirates',
    'south korea': 'korea, republic of',
    'north korea': "korea, democratic people's republic of"
  };

  const dataByCountry = useMemo(() => {
    const map = new Map<string, GeoInsight>();
    safeData.forEach((item) => {
      const key = item.country.toLowerCase();
      map.set(key, item);
      const alias = countryAliases[key];
      if (alias) map.set(alias, item);
    });
    return map;
  }, [safeData]);

  const maxRisk = useMemo(() => Math.max(...safeData.map((d) => d.avgRisk || 0), 1), [safeData]);

  const interpolate = (value: number, max: number) => {
    const clamped = Math.min(Math.max(value, 0), max);
    const t = max === 0 ? 0 : clamped / max;
    // Simple lerp from green (#10b981) to red (#ef4444)
    const from = [16, 185, 129];
    const to = [239, 68, 68];
    const c = from.map((f, i) => Math.round(f + (to[i] - f) * t));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  };

  const getFill = (name: string) => {
    const match = dataByCountry.get(name.toLowerCase());
    if (!match) return '#cbd8ea'; // Light neutral base so outlines pop
    return interpolate(match.avgRisk ?? 0, maxRisk);
  };

  const width = 900;
  const height = 480;
  const projection = geoNaturalEarth1().scale(170).translate([width / 2, height / 2]);
  const pathGenerator = geoPath(projection);

  if (isLoading) {
    return <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse min-h-[360px]" />;
  }

  if (features.length === 0) {
    return <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse min-h-[360px]" />;
  }

  if (error || geoError) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg min-h-[360px] flex items-center justify-center">
        <p className="text-text-muted text-sm">Geo map unavailable</p>
      </div>
    );
  }

  const hasData = safeData.length > 0 && features.length > 0;
  const maxCount = Math.max(...safeData.map((d) => d.customerCount || 0), 1);

  return (
    <div className="bg-white/95 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Global risk & LTV</h3>
          <p className="text-text-muted text-sm">Colored by average risk, sized by customers</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
            <span>Low risk</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
            <span>High risk</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border-primary/20 bg-white">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" className="w-full h-[360px]" aria-label="Geo risk map">
          <defs>
            <linearGradient id="map-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
            </linearGradient>
          </defs>
          <rect width={width} height={height} fill="#f7fbff" />
          <rect width={width} height={height} fill="url(#map-gradient)" />
          <g>
            {features.map((feature, idx) => {
              const name = (feature.properties?.name as string) ?? 'Unknown';
              const d = pathGenerator(feature as any);
              if (!d) return null;
              const countryData = dataByCountry.get(name.toLowerCase());
              const fill = getFill(name);
              return (
                <path
                  key={`${name}-${idx}`}
                  d={d}
                  fill={fill}
                  stroke="rgba(17,27,45,0.28)"
                  strokeWidth={0.5}
                  className="transition duration-150"
                >
                  {countryData && (
                    <title>
                      {name}: {countryData.customerCount} customers | Avg LTV ${countryData.avgLtv.toFixed(0)} | Risk {countryData.avgRisk.toFixed(1)}%
                    </title>
                  )}
                </path>
              );
            })}

            {features.map((feature, idx) => {
              const name = (feature.properties?.name as string) ?? 'Unknown';
              const countryData = dataByCountry.get(name.toLowerCase());
              if (!countryData) return null;
              const centroid = geoCentroid(feature as any);
              const projected = projection(centroid as [number, number]);
              if (!projected) return null;
              const radius = Math.max(3, Math.min(12, 4 + (countryData.customerCount / maxCount) * 10));
              const fill = interpolate(countryData.avgRisk ?? 0, maxRisk);

              return (
                <g key={`${name}-${idx}-marker`} transform={`translate(${projected[0]},${projected[1]})`}>
                  <circle
                    r={radius}
                    fill={fill}
                    fillOpacity={0.85}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth={0.6}
                  >
                    <title>
                      {name}: {countryData.customerCount} customers | Avg LTV ${countryData.avgLtv.toFixed(0)} | Risk {countryData.avgRisk.toFixed(1)}%
                    </title>
                  </circle>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
