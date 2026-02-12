import React, { useEffect, useMemo, useState } from 'react';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature as topoToGeo } from 'topojson-client';

type GeoSegmentMapItem = {
  name: string;
  customerCount: number;
  mrr: number;
  avgRiskScore: number;
};

type GeoSegmentMapProps = {
  segments: GeoSegmentMapItem[];
  selectedRegion?: string | null;
  onRegionSelect?: (region: string) => void;
};

const WORLD_TOPOJSON = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'united states of america',
  'united states': 'united states of america',
  uk: 'united kingdom',
  'great britain': 'united kingdom',
  uae: 'united arab emirates',
  'south korea': 'korea, republic of',
  'north korea': "korea, democratic people's republic of",
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
};

const normalizeName = (value: string) => value.trim().toLowerCase();

export const GeoSegmentMap: React.FC<GeoSegmentMapProps> = ({
  segments,
  selectedRegion,
  onRegionSelect,
}) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch(WORLD_TOPOJSON)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;

        try {
          const object =
            json.objects?.countries
            || json.objects?.countries110m
            || json.objects?.ne_110m_admin_0_countries;

          if (!object) {
            throw new Error('No country topology found');
          }

          const geoResult = topoToGeo(json as any, object) as
            | FeatureCollection<Geometry, Record<string, unknown>>
            | Feature<Geometry, Record<string, unknown>>;

          const parsedFeatures =
            (geoResult as FeatureCollection<Geometry, Record<string, unknown>>)?.features
            ?? (geoResult ? [geoResult as Feature] : []);

          setFeatures(parsedFeatures);
          setMapError(null);
        } catch (error) {
          setMapError(error instanceof Error ? error.message : 'Unable to parse map data');
        }
      })
      .catch((error) => {
        if (!mounted) return;
        setMapError(error instanceof Error ? error.message : 'Unable to load map data');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const dataByRegion = useMemo(() => {
    const map = new Map<string, GeoSegmentMapItem>();

    segments.forEach((segment) => {
      const key = normalizeName(segment.name);
      map.set(key, segment);

      if (COUNTRY_ALIASES[key]) {
        map.set(COUNTRY_ALIASES[key], segment);
      }
    });

    return map;
  }, [segments]);

  const maxRisk = useMemo(
    () => Math.max(...segments.map((segment) => segment.avgRiskScore || 0), 1),
    [segments],
  );

  const maxCustomers = useMemo(
    () => Math.max(...segments.map((segment) => segment.customerCount || 0), 1),
    [segments],
  );

  const interpolateRiskColor = (value: number) => {
    const t = Math.min(Math.max(value / maxRisk, 0), 1);
    const from = [34, 197, 94];
    const to = [239, 68, 68];
    const color = from.map((channel, index) => Math.round(channel + (to[index] - channel) * t));
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  };

  const width = 900;
  const height = 480;
  const projection = geoNaturalEarth1().scale(170).translate([width / 2, height / 2]);
  const pathGenerator = geoPath(projection);

  if (mapError) {
    return (
      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <p className="text-sm text-text-muted">Geo map unavailable ({mapError}).</p>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
        <div className="h-[360px] animate-pulse rounded-xl bg-surface-secondary/30" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-primary/30 bg-surface-primary/90 p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-semibold text-text-primary">Geo Risk Map</h4>
          <p className="text-sm text-text-muted">Color = avg risk. Marker size = customer count.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
            Low risk
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
            High risk
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border-primary/20 bg-[#f7fbff]">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-[360px] w-full" role="img" aria-label="Geo segment map">
          <g>
            {features.map((feature, index) => {
              const name = (feature.properties?.name as string) ?? 'Unknown';
              const path = pathGenerator(feature as any);
              if (!path) return null;

              const segment = dataByRegion.get(normalizeName(name));
              const isSelected =
                selectedRegion
                && normalizeName(selectedRegion) === normalizeName(segment?.name ?? '');

              return (
                <path
                  key={`${name}-${index}`}
                  d={path}
                  fill={segment ? interpolateRiskColor(segment.avgRiskScore) : '#d6e3f5'}
                  stroke={isSelected ? '#111827' : 'rgba(15, 23, 42, 0.24)'}
                  strokeWidth={isSelected ? 1.25 : 0.6}
                  className={segment ? 'cursor-pointer transition-colors' : ''}
                  onClick={() => {
                    if (!segment || !onRegionSelect) return;
                    onRegionSelect(segment.name);
                  }}
                >
                  {segment && (
                    <title>
                      {segment.name}: {segment.customerCount} customers | Avg risk {segment.avgRiskScore.toFixed(1)} | MRR {formatCurrency(segment.mrr)}
                    </title>
                  )}
                </path>
              );
            })}

            {features.map((feature, index) => {
              const name = (feature.properties?.name as string) ?? 'Unknown';
              const segment = dataByRegion.get(normalizeName(name));
              if (!segment) return null;

              const centroid = geoCentroid(feature as any);
              const projected = projection(centroid as [number, number]);
              if (!projected) return null;

              const radius = Math.max(3, Math.min(12, 4 + (segment.customerCount / maxCustomers) * 10));
              const isSelected =
                selectedRegion
                && normalizeName(selectedRegion) === normalizeName(segment.name);

              return (
                <circle
                  key={`${name}-${index}-marker`}
                  cx={projected[0]}
                  cy={projected[1]}
                  r={radius}
                  fill={interpolateRiskColor(segment.avgRiskScore)}
                  fillOpacity={0.9}
                  stroke={isSelected ? '#111827' : 'rgba(255, 255, 255, 0.8)'}
                  strokeWidth={isSelected ? 1.5 : 0.8}
                  className="cursor-pointer transition-colors"
                  onClick={() => {
                    if (!onRegionSelect) return;
                    onRegionSelect(segment.name);
                  }}
                >
                  <title>
                    {segment.name}: {segment.customerCount} customers | Avg risk {segment.avgRiskScore.toFixed(1)} | MRR {formatCurrency(segment.mrr)}
                  </title>
                </circle>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
