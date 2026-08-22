import { useEffect, useState } from "react";
import { X } from "lucide-react";
import m1 from "@/assets/mascot-1.webp.asset.json";
import m2 from "@/assets/mascot-2.webp.asset.json";
import m3 from "@/assets/mascot-3.webp.asset.json";
import m4 from "@/assets/mascot-4.webp.asset.json";

const MASCOTS = [m1.url, m2.url, m3.url, m4.url];

export function HomeMascot() {
  const [state] = useState<{ src: string; side: "left" | "right" }>(() => ({
    src: MASCOTS[Math.floor(Math.random() * MASCOTS.length)] ?? MASCOTS[0]!,
    side: Math.random() < 0.5 ? "left" : "right",
  }));
  const [closed, setClosed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = state.src;
    const show = () => setVisible(true);
    if (img.complete) show();
    else {
      img.onload = show;
      img.onerror = show;
    }
    const t = setTimeout(show, 1200);
    return () => clearTimeout(t);
  }, [state.src]);

  if (closed) return null;


  return (
    <div
      className={`pointer-events-none fixed bottom-0 z-30 hidden select-none md:block ${
        state.side === "left" ? "left-0" : "right-0"
      }`}
    >
      <div
        className="relative transition-all duration-1000 ease-out"
        style={{
          transform: visible
            ? "translateY(0) translateX(0)"
            : `translateY(24px) translateX(${state.side === "left" ? "-40px" : "40px"})`,
          opacity: visible ? 1 : 0,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-x-4 bottom-0 h-40 rounded-full bg-primary/20 blur-3xl"
        />
        <img
          src={state.src}
          alt=""
          aria-hidden
          className="relative h-[clamp(220px,32vw,380px)] w-auto object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          style={{
            maskImage: "linear-gradient(to bottom, black 74%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 74%, transparent 100%)",
            transform: state.side === "left" ? "scaleX(-1)" : undefined,
          }}
        />
        <button
          type="button"
          onClick={() => setState(null)}
          aria-label="Ocultar mascota"
          className={`pointer-events-auto absolute top-2 grid size-7 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground opacity-0 backdrop-blur transition-opacity hover:text-foreground focus:opacity-100 ${
            state.side === "left" ? "right-2" : "left-2"
          }`}
          style={{ opacity: visible ? 0.35 : 0 }}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
