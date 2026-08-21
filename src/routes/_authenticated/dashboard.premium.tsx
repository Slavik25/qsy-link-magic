import { createFileRoute } from "@tanstack/react-router";
import { Check, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard/premium")({
  component: PremiumPage,
  head: () => ({
    meta: [
      { title: "Premium · QSY" },
      { name: "description", content: "Desbloquea todas las funciones avanzadas de tu biolink QSY." },
    ],
  }),
});

const perks = [
  "Badges personalizados y reordenables",
  "Efectos de fondo y de username exclusivos",
  "Analytics avanzados con exportación",
  "Dominios premium: qsy.rip, qsy.es y qsy.bio",
  "Hosting de imágenes y audio ilimitado",
  "Widgets de Discord, Spotify y gaming",
];

function PremiumPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Gem className="size-5 text-primary" /> Premium
        </h1>
        <p className="text-sm text-muted-foreground">
          Lleva tu perfil QSY al máximo nivel con funciones exclusivas.
        </p>
      </header>

      <section className="rounded-3xl border border-primary/30 bg-primary/10 p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">QSY Premium</p>
        <p className="mt-3 text-4xl font-extrabold">
          4,99 € <span className="text-base font-normal text-muted-foreground">/ mes</span>
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {perks.map((p) => (
            <li key={p} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{p}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-8 rounded-xl px-8">Mejorar ahora</Button>
      </section>
    </div>
  );
}
