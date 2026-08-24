import { useState } from "react";

export type MapPoint = {
  id: string;
  ip: string;
  lat: number;
  lon: number;
  label: string;
  hits: number;
};

/**
 * Mapa mundial equirectangular con puntos de IP. El SVG del mapa vive en
 * /world-equirect.svg (proyección plana: x = lon, y = lat).
 */
export function WorldMap({
  points,
  onSelect,
}: {
  points: MapPoint[];
  onSelect?: (ip: string) => void;
}) {
  const [hover, setHover] = useState<MapPoint | null>(null);
  const max = Math.max(1, ...points.map((p) => p.hits));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-surface">
      <div className="relative aspect-[2/1] w-full">
        <img
          src="/world-equirect.svg"
          alt="Mapa mundial con las últimas conexiones registradas"
          className="absolute inset-0 size-full object-fill opacity-25 [filter:invert(0.5)]"
          loading="lazy"
        />
        <div className="absolute inset-0">
          {points.map((p) => {
            const left = ((p.lon + 180) / 360) * 100;
            const top = ((90 - p.lat) / 180) * 100;
            const size = 6 + (p.hits / max) * 10;
            return (
              <button
                key={p.id}
                type="button"
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelect?.(p.ip)}
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.9)] ring-2 ring-primary/30 transition-transform hover:scale-150"
                aria-label={p.label}
              />
            );
          })}
        </div>
        {hover && (
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-xl border border-border/60 bg-card/90 px-3 py-2 text-[11px] backdrop-blur">
            <div className="font-mono">{hover.ip}</div>
            <div className="text-muted-foreground">{hover.label}</div>
            <div className="text-muted-foreground">{hover.hits} registros</div>
          </div>
        )}
      </div>
    </div>
  );
}
