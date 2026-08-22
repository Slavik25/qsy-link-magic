import { useState } from "react";
import bg1 from "@/assets/dashbg-1.gif.asset.json";
import bg2 from "@/assets/dashbg-2.gif.asset.json";
import bg3 from "@/assets/dashbg-3.gif.asset.json";

const BGS = [bg1.url, bg2.url, bg3.url];

export function DashBackground() {
  const [src] = useState(() => BGS[Math.floor(Math.random() * BGS.length)] ?? BGS[0]!);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <img
        src={src}
        alt=""
        className="size-full object-cover opacity-[0.10] mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-background/88" />
      <div className="absolute inset-0 bg-primary/10" />
    </div>
  );
}
