import { useEffect } from "react";
import { BadgeCheck, Eye, Heart, MapPin, Play } from "lucide-react";
import { ProfilePlayer, isFloatingPlayer } from "@/components/qsy/profile-player";
import { ProfileDiscord } from "@/components/qsy/profile-discord";
import { ProfileGaming } from "@/components/qsy/profile-gaming";
import { ProfileMedia } from "@/components/qsy/profile-media";
import { ProfileLikeButton } from "@/components/qsy/profile-like";
import { iconFor, labelFor, textPaint, type Profile, type ProfileLink, type Social } from "@/lib/qsy";
import { platformById } from "@/lib/link-platforms";
import { badgeByKey } from "@/lib/badges";
import { decorationByKey } from "@/lib/shop";
import { ProfileStreak } from "@/components/qsy/profile-streak";
import { ensureFontLoaded, fontByKey } from "@/lib/fonts";

type Props = {
  profile: Pick<
    Profile,
    "username" | "display_name" | "bio" | "location" | "avatar_url" | "banner_url" | "verified" | "theme"
  >;
  links: Pick<ProfileLink, "id" | "title" | "url" | "icon">[];
  socials: Pick<Social, "id" | "platform" | "url">[];
  badges?: (string | { key: string; obtained_at?: string | null })[];
  views?: number;
  likes?: number;
  profileId?: string;
  userId?: string | null;
  music?: { title?: string; artist?: string } | null;
  compact?: boolean;
  onLinkClick?: (link: { id: string; title: string; url: string }) => void;
};

export function ProfileView({
  profile,
  links,
  socials,
  badges = [],
  views = 0,
  likes = 0,
  profileId,
  userId,
  music,
  compact = false,
  onLinkClick,
}: Props) {
  const t = profile.theme;
  const deco = decorationByKey(t.avatar_decoration);
  const style = {
    "--p-accent": t.accent,
    "--p-radius": `${t.radius}px`,
    "--p-blur": `${t.blur}px`,
    "--p-surface": `rgb(255 255 255 / ${t.opacity / 400})`,
    "--p-glow": `${t.glow / 100}`,
  } as React.CSSProperties;

  const showCard = t.show_card !== false;
  const template = t.template || "glass";
  const shape = t.avatar_shape ?? "circle";
  const shapeClass = `qsy-shape-${shape}`;
  const cardBg = t.card_bg_type ?? "solid";
  const ang = t.grad_angle ?? 90;
  const namePaint = textPaint(t.color_name ?? t.color_text, t.color_name_2, t.grad_name, ang);
  const userPaint = textPaint(t.color_username ?? "#a1a1aa", t.color_username_2, t.grad_username, ang, "#a1a1aa");
  const bioPaint = textPaint(t.color_bio ?? "#e4e4e7", t.color_bio_2, t.grad_bio, ang, "#e4e4e7");
  const statsPaint = textPaint(t.color_stats ?? "#a1a1aa", t.color_stats_2, t.grad_stats, ang, "#a1a1aa");
  const iconStyle: React.CSSProperties = { color: t.color_icon ?? "#ffffff" };
  const iconChipBg = t.grad_icon
    ? `linear-gradient(${ang}deg, color-mix(in oklab, ${t.color_icon ?? "#ffffff"} 22%, transparent), color-mix(in oklab, ${t.color_icon_2 ?? t.accent} 22%, transparent))`
    : t.color_icon_bg
      ? `color-mix(in oklab, ${t.color_icon_bg} 12%, transparent)`
      : "var(--p-surface)";
  const cardAlpha = cardBg === "transparent" ? 0 : Math.max(0, Math.min(100, t.card_alpha ?? 100));
  const hoverEffect = t.hover_effect && t.hover_effect !== "none" ? t.hover_effect : null;
  const hoverClass = hoverEffect ? `qsy-hover qsy-hover-${hoverEffect}` : "";
  const alphaStyle =
    cardAlpha < 100 ? ({ "--p-card-alpha": `${cardAlpha / 100}` } as React.CSSProperties) : {};

  const font = fontByKey(t.font);
  useEffect(() => {
    ensureFontLoaded(t.font);
  }, [t.font]);
  const fontStyle: React.CSSProperties = {
    fontFamily: font.stack,
    ...(t.font_weight ? { fontWeight: t.font_weight } : {}),
    ...(t.font_spacing ? { letterSpacing: `${t.font_spacing}em` } : {}),
    ...(t.font_scale && t.font_scale !== 1 ? { fontSize: `${t.font_scale}rem` } : {}),
  };

  const streakPos = t.streak_position ?? "stats";
  const streakNode =
    t.show_streak && userId ? (
      <ProfileStreak userId={userId} accent={t.accent} theme={t} />
    ) : null;

  return (
    <div
      style={{ ...style, ...alphaStyle, ...fontStyle }}
      className={`qsy-card relative w-full overflow-hidden ${hoverClass} ${
        showCard
          ? `qsy-tpl qsy-tpl-${template} ${cardAlpha < 100 ? "qsy-tpl-alpha" : ""}`
          : "border-0 bg-transparent"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${showCard ? "" : "hidden"}`}
        style={{
          background: `radial-gradient(70% 45% at 50% -5%, color-mix(in oklab, ${t.accent} calc(var(--p-glow) * 40%), transparent), transparent 70%)`,
        }}
      />


      {profile.banner_url && (
        <div className={`qsy-banner relative w-full overflow-hidden ${compact ? "h-24" : "h-36 sm:h-40"}`}>
          <img
            src={profile.banner_url}
            alt={`Banner de ${profile.display_name || profile.username}`}
            loading="lazy"
            className="size-full object-cover"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(180deg, transparent 30%, color-mix(in oklab, var(--background) 85%, transparent))`,
            }}
          />
        </div>
      )}

      <div
        className={`relative ${
          showCard ? (compact ? "px-5 pb-5" : "px-6 pb-8 sm:px-10 sm:pb-10") : "px-0 pb-0"
        } ${profile.banner_url ? "pt-0" : showCard ? (compact ? "pt-5" : "pt-6 sm:pt-10") : "pt-0"}`}
      >
      <div className="qsy-body relative flex flex-col items-center text-center">
        <div
          className={`qsy-avatar-ring relative p-[3px] ${shapeClass} ${
            profile.banner_url ? (compact ? "-mt-8" : "-mt-12") : ""
          }`}
          style={{
            background: `linear-gradient(140deg, ${t.accent}, transparent)`,
            boxShadow: `0 18px 40px -18px ${t.accent}`,
          }}
        >
          {deco?.image && (
            <img
              aria-hidden
              alt=""
              src={deco.image}
              loading="lazy"
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 aspect-square h-[150%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 select-none object-contain"
            />
          )}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={`Avatar de ${profile.display_name || profile.username}`}
              width={compact ? 72 : 96}
              height={compact ? 72 : 96}
              loading="lazy"
              className={`qsy-avatar object-cover ${shapeClass} ${compact ? "size-16" : "size-24"}`}
            />
          ) : (
            <span
              className={`qsy-avatar qsy-avatar-fallback grid place-items-center bg-background font-mono font-bold ${shapeClass} ${
                compact ? "size-16 text-lg" : "size-24 text-2xl"
              }`}
              style={{ color: t.accent }}
            >
              {profile.username.slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>



        {streakPos === "top-left" || streakPos === "top-right" ? (
          <div
            className={`pointer-events-none absolute top-3 z-20 text-[11px] ${
              streakPos === "top-left" ? "left-3" : "right-3"
            }`}
            style={statsPaint}
          >
            {streakNode}
          </div>
        ) : null}

        <div className="qsy-name-row mt-4 flex items-center gap-1.5">
          <h1
            className={`qsy-name font-semibold tracking-tight ${compact ? "text-lg" : "text-2xl sm:text-3xl"} ${
              t.font === "mono" ? "font-mono" : ""
            } ${
              t.username_effect && t.username_effect !== "none"
                ? `qsy-name-${t.username_effect}`
                : ""
            }`}
            style={namePaint}
          >
            {profile.display_name}
          </h1>
          {profile.verified && (
            <BadgeCheck className="size-5" style={{ color: t.accent }} aria-label="Verificado" />
          )}
        </div>
        <p className="qsy-username text-sm" style={userPaint}>@{profile.username}</p>
        {streakPos === "under-name" ? (
          <div className="mt-2 text-xs" style={statsPaint}>{streakNode}</div>
        ) : null}

        {badges.length > 0 && (
          <div className="qsy-badges mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {badges.map((entry) => {
              const key = typeof entry === "string" ? entry : entry.key;
              const obtainedAt = typeof entry === "string" ? null : (entry.obtained_at ?? null);
              const b = badgeByKey(key);
              if (!b) return null;
              return (
                <span
                  key={key}
                  aria-label={b.name}
                  className="qsy-badge group relative grid size-7 place-items-center rounded-lg border border-white/10 transition-transform hover:-translate-y-0.5"
                  style={{ background: iconChipBg }}
                >
                  {b.img ? (
                    <img src={b.img} alt={b.name} className="size-5" loading="lazy" />
                  ) : b.icon ? (
                    <b.icon className="size-4" style={{ color: b.color ?? t.accent }} />
                  ) : null}
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-30 w-56 -translate-x-1/2 scale-95 rounded-xl border border-white/10 bg-[#0b0b12]/95 p-3 text-left opacity-0 shadow-2xl backdrop-blur transition duration-150 group-hover:scale-100 group-hover:opacity-100"
                  >
                    <span className="block text-xs font-semibold text-white">{b.name}</span>
                    <span className="mt-1 block text-[11px] leading-snug text-white/70">{b.description}</span>
                    <span className="mt-2 block text-[10px] uppercase tracking-wide text-white/45">
                      {obtainedAt
                        ? `Obtenida el ${new Date(obtainedAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}`
                        : "Fecha de obtención no disponible"}
                    </span>
                  </span>
                </span>
              );
            })}
          </div>
        )}

        {profile.location && (
          <p className="qsy-location mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {profile.location}
          </p>
        )}

        {profile.bio && (
          <p className="qsy-bio mt-3 max-w-md text-sm" style={bioPaint}>&ldquo;{profile.bio}&rdquo;</p>
        )}

        <ProfileDiscord theme={t} />

        <ProfileGaming theme={t} />

        {(socials.length > 0 || links.length > 0) && (
          <div className="qsy-links mt-6 flex flex-wrap items-center justify-center gap-3">
            {socials.map((s) => {
              const Icon = iconFor(s.platform);
              return (
                <a
                  key={`s-${s.id}`}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={labelFor(s.platform)}
                  title={labelFor(s.platform)}
                  className="qsy-link group relative grid size-11 place-items-center border transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderRadius: "999px",
                    background: iconChipBg,
                    backdropFilter: `blur(var(--p-blur))`,
                    borderColor: `color-mix(in oklab, ${t.accent} 28%, transparent)`,
                  }}
                >
                  <Icon
                    className="qsy-link-icon size-[18px] opacity-80 transition-opacity group-hover:opacity-100"
                    style={iconStyle}
                  />
                  <span
                    className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-white/10 bg-black/85 px-2 py-1 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backdropFilter: "blur(8px)" }}
                  >
                    {labelFor(s.platform)}
                  </span>
                </a>
              );
            })}

            {links.map((l) => {
              const Icon = platformById(l.icon).Icon;
              return (
                <a
                  key={`l-${l.id}`}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={() => onLinkClick?.(l)}
                  aria-label={l.title}
                  title={l.title}
                  className="qsy-link group relative grid size-11 place-items-center border transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderRadius: "999px",
                    background: iconChipBg,
                    backdropFilter: `blur(var(--p-blur))`,
                    borderColor: `color-mix(in oklab, ${t.accent} 28%, transparent)`,
                  }}
                >
                  <Icon
                    className="qsy-link-icon size-[18px] opacity-80 transition-opacity group-hover:opacity-100"
                    style={iconStyle}
                  />
                  <span
                    className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-white/10 bg-black/85 px-2 py-1 text-[10px] font-medium opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ backdropFilter: "blur(8px)" }}
                  >
                    {l.title}
                  </span>
                </a>
              );
            })}
          </div>
        )}

        {t.media && t.media.length > 0 && <ProfileMedia theme={t} items={t.media} />}

        {t.audio_url && !isFloatingPlayer(t) && (
          <div className="mt-6 flex w-full justify-center">
            <ProfilePlayer theme={t} music={music} />
          </div>
        )}

        {!t.audio_url && music?.title && (
          <div
            className="mt-6 flex w-full max-w-md items-center gap-3 border px-4 py-3 text-left"
            style={{
              borderRadius: "var(--p-radius)",
              background: iconChipBg,
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

        <div className="qsy-stats mt-6 flex items-center justify-center gap-4 text-xs" style={statsPaint}>
          {t.show_views !== false && (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-3" />
              {views.toLocaleString()} visitas
            </span>
          )}
          {t.show_likes !== false &&
            (profileId && !compact ? (
              <ProfileLikeButton profileId={profileId} accent={t.accent} initialLikes={likes} />
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Heart className="size-3" style={{ color: t.accent }} />
                {likes.toLocaleString()} likes
              </span>
            ))}
          {streakPos === "stats" ? streakNode : null}
        </div>

        {streakPos === "bottom" ? (
          <div className="mt-4 flex justify-center text-xs" style={statsPaint}>{streakNode}</div>
        ) : null}
      </div>
      </div>
    </div>
  );


}
