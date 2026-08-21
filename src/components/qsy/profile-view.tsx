import { BadgeCheck, Eye, MapPin, Play } from "lucide-react";
import { iconFor, labelFor, type Profile, type ProfileLink, type Social } from "@/lib/qsy";

type Props = {
  profile: Pick<
    Profile,
    "username" | "display_name" | "bio" | "location" | "avatar_url" | "banner_url" | "verified" | "theme"
  >;
  links: Pick<ProfileLink, "id" | "title" | "url" | "icon">[];
  socials: Pick<Social, "id" | "platform" | "url">[];
  views?: number;
  music?: { title?: string; artist?: string } | null;
  compact?: boolean;
  onLinkClick?: (link: { id: string; title: string; url: string }) => void;
};

export function ProfileView({
  profile,
  links,
  socials,
  views = 0,
  music,
  compact = false,
  onLinkClick,
}: Props) {
  const t = profile.theme;
  const style = {
    "--p-accent": t.accent,
    "--p-radius": `${t.radius}px`,
    "--p-blur": `${t.blur}px`,
    "--p-surface": `rgb(255 255 255 / ${t.opacity / 400})`,
    "--p-glow": `${t.glow / 100}`,
  } as React.CSSProperties;

  return (
    <div
      style={style}
      className={`relative w-full overflow-hidden rounded-2xl border border-border bg-background/60 ${
        compact ? "p-5" : "p-6 sm:p-10"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(70% 45% at 50% -5%, color-mix(in oklab, ${t.accent} calc(var(--p-glow) * 40%), transparent), transparent 70%)`,
        }}
      />
      <div className="relative flex flex-col items-center text-center">
        <div
          className="relative rounded-full p-[2px]"
          style={{ background: `linear-gradient(140deg, ${t.accent}, transparent)` }}
        >
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Avatar de ${profile.display_name || profile.username}`}
              width={compact ? 72 : 96}
              height={compact ? 72 : 96}
              loading="lazy"
              className={`rounded-full object-cover ${compact ? "size-16" : "size-24"}`}
            />
          ) : (
            <span
              className={`grid place-items-center rounded-full bg-background font-mono font-bold ${
                compact ? "size-16 text-lg" : "size-24 text-2xl"
              }`}
              style={{ color: t.accent }}
            >
              {profile.username.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <h1
            className={`font-semibold tracking-tight ${compact ? "text-lg" : "text-2xl sm:text-3xl"} ${
              t.font === "mono" ? "font-mono" : ""
            }`}
          >
            {profile.display_name}
          </h1>
          {profile.verified && (
            <BadgeCheck className="size-5" style={{ color: t.accent }} aria-label="Verificado" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>

        {profile.location && (
          <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {profile.location}
          </p>
        )}

        {profile.bio && (
          <p className="mt-3 max-w-md text-sm text-foreground/80">&ldquo;{profile.bio}&rdquo;</p>
        )}

        {socials.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {socials.map((s) => {
              const Icon = iconFor(s.platform);
              return (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={labelFor(s.platform)}
                  className="grid size-10 place-items-center rounded-xl glass lift hover:bg-surface-strong"
                  style={{ borderRadius: "var(--p-radius)" }}
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        )}

        <div className="mt-6 w-full max-w-md space-y-3">
          {links.map((l) => {
            const Icon = iconFor(l.icon);
            return (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => onLinkClick?.(l)}
                className="group flex items-center gap-3 border px-4 py-3 text-sm font-medium lift"
                style={{
                  borderRadius: "var(--p-radius)",
                  background: "var(--p-surface)",
                  backdropFilter: `blur(var(--p-blur))`,
                  borderColor: `color-mix(in oklab, ${t.accent} 25%, transparent)`,
                }}
              >
                <Icon className="size-4 shrink-0" style={{ color: t.accent }} />
                <span className="flex-1 text-left">{l.title}</span>
                <span className="text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  ↗
                </span>
              </a>
            );
          })}
        </div>

        {music?.title && (
          <div
            className="mt-6 flex w-full max-w-md items-center gap-3 border px-4 py-3 text-left"
            style={{
              borderRadius: "var(--p-radius)",
              background: "var(--p-surface)",
              borderColor: `color-mix(in oklab, ${t.accent} 25%, transparent)`,
            }}
          >
            <span
              className="grid size-9 place-items-center rounded-full"
              style={{ background: t.accent, color: "#0b0b0b" }}
            >
              <Play className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{music.title}</p>
              <p className="truncate text-xs text-muted-foreground">{music.artist}</p>
            </div>
          </div>
        )}

        <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Eye className="size-3" />
          {views.toLocaleString()} visitas
        </p>
      </div>
    </div>
  );
}
