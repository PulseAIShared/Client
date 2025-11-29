import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { geoCentroid } from 'd3-geo';
import { GeoInsight } from '@/types/api';

const WORLD_TOPO_JSON = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface GeoMapProps {
  data?: GeoInsight[];
  isLoading?: boolean;
  error?: Error | null;
}

export const GeoMap: React.FC<GeoMapProps> = ({ data, isLoading, error }) => {
  const safeData = data ?? [];

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
    if (!match) return '#1f2937'; // Visible neutral base
    return interpolate(match.avgRisk ?? 0, maxRisk);
  };

  if (isLoading) {
    return <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg animate-pulse min-h-[360px]" />;
  }

  if (error || safeData.length === 0) {
    return (
      <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg min-h-[360px] flex items-center justify-center">
        <p className="text-text-muted text-sm">Geo map unavailable</p>
      </div>
    );
  }

  const maxCount = Math.max(...safeData.map((d) => d.customerCount || 0), 1);

  return (
    <div className="bg-surface-primary/80 backdrop-blur-lg p-6 rounded-2xl border border-border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300">
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

      <div className="rounded-2xl overflow-hidden border border-border-primary/20 bg-surface-secondary/60">
        <ComposableMap projectionConfig={{ scale: 180 }} style={{ width: '100%', height: 360 }}>
          <ZoomableGroup zoom={1.4} center={[10, 20]}>
            <Geographies geography={WORLD_TOPO_JSON}>
              {({ geographies }) => (
                <>
                  {geographies.map((geo) => {
                    const name = (geo.properties as { name: string }).name;
                    const countryData = dataByCountry.get(name.toLowerCase());
                    const fill = getFill(name);

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth={0.4}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none', filter: 'brightness(1.05)', cursor: countryData ? 'pointer' : 'default' },
                          pressed: { outline: 'none' }
                        }}
                        fill={fill}
                        tabIndex={-1}
                        aria-label={name}
                      >
                        {countryData && (
                          <title>
                            {name}: {countryData.customerCount} customers | Avg LTV ${countryData.avgLtv.toFixed(0)} | Risk {countryData.avgRisk.toFixed(1)}%
                          </title>
                        )}
                      </Geography>
                    );
                  })}

                  {geographies.map((geo) => {
                    const name = (geo.properties as { name: string }).name;
                    const countryData = dataByCountry.get(name.toLowerCase());
                    if (!countryData) return null;
                    const centroid = geoCentroid(geo);
                    const radius = Math.max(3, Math.min(12, 4 + (countryData.customerCount / maxCount) * 10));
                    const fill = interpolate(countryData.avgRisk ?? 0, maxRisk);

                    return (
                      <Marker key={`${geo.rsmKey}-marker`} coordinates={centroid}>
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
                      </Marker>
                    );
                  })}
                </>
              )}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
};
