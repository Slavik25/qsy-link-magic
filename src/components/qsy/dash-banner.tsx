type Props = {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional artwork shown on the right side of the banner. */
  image?: string;
  tone?: "violet" | "gold" | "teal";
};

const TONES = {
  violet: "from-primary/35 via-primary/10 to-transparent",
  gold: "from-amber-500/30 via-amber-500/10 to-transparent",
  teal: "from-teal-400/30 via-teal-400/10 to-transparent",
} as const;

/** Wide hero banner used at the top of every dashboard page. */
export function DashBanner({ eyebrow, title, description, image, tone = "violet" }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/50 backdrop-blur-xl">
      <div className={`absolute inset-0 bg-gradient-to-r ${TONES[tone]}`} aria-hidden />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {image && (
        <img
          src={image}
          alt=""
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 hidden h-full w-3/5 object-cover object-right opacity-90 sm:block [mask-image:linear-gradient(to_right,transparent,black_45%)]"
        />
      )}
      <div className="relative max-w-xl p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
