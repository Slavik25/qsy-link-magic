import { useEffect, useState } from "react";
import { Users, ExternalLink } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import type { ThemeConfig } from "@/lib/qsy";

type Lanyard = {
  discord_user?: { id: string; username: string; global_name?: string | null; avatar?: string | null };
  discord_status?: "online" | "idle" | "dnd" | "offline";
  activities?: { id: string; name: string; type: number; state?: string; details?: string }[];
};

type DUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  banner?: string | null;
  accent_color?: number | null;
};

type Widget = {
  id: string;
  name: string;
  instant_invite?: string | null;
  presence_count?: number;
  members?: { id: string; username: string; avatar_url?: string; status?: string }[];
};

const STATUS: Record<string, { label: string; color: string }> = {
  online: { label: "En línea", color: "#23a55a" },
  idle: { label: "Ausente", color: "#f0b232" },
  dnd: { label: "No molestar", color: "#f23f43" },
  offline: { label: "Desconectado", color: "#80848e" },
};

function avatarUrl(u: DUser | null | undefined) {
  if (!u?.avatar) return null;
  const ext = u.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=160`;
}

function Shell({
  accent,
  children,
  className = "",
}: {
  accent: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden border transition-all duration-300 ${className}`}
      style={{
        borderRadius: "var(--p-radius)",
        background: "var(--p-surface)",
        backdropFilter: "blur(var(--p-blur))",
        borderColor: `color-mix(in oklab, ${accent} 28%, transparent)`,
        boxShadow: `0 10px 30px -18px ${accent}`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-14 size-32 rounded-full opacity-30 blur-3xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      {children}
    </div>
  );
}

export function ProfileDiscord({ theme }: { theme: ThemeConfig }) {
  const accent = theme.accent;
  const userId = (theme.discord_id ?? "").trim();
  const guildId = (theme.discord_server_id ?? "").trim();
  const showUser = userId.length > 5 && theme.discord_show_profile !== false;
  const showGuild = guildId.length > 5 && theme.discord_show_server !== false;

  const [presence, setPresence] = useState<Lanyard | null>(null);
  const [user, setUser] = useState<DUser | null>(null);
  const [guild, setGuild] = useState<Widget | null>(null);

  useEffect(() => {
    if (!showUser) {
      setPresence(null);
      setUser(null);
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const j = r.ok ? await r.json() : null;
        if (alive && j?.success && j?.data) {
          setPresence(j.data as Lanyard);
          if (j.data.discord_user) setUser(j.data.discord_user as DUser);
          return;
        }
      } catch {
        /* ignore */
      }
      try {
        const r = await fetch(`https://dcdn.dstn.to/profile/${userId}`);
        const j = r.ok ? await r.json() : null;
        if (alive && j?.user) setUser(j.user as DUser);
      } catch {
        if (alive) setUser(null);
      }
    };
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [showUser, userId]);

  useEffect(() => {
    if (!showGuild) return setGuild(null);
    let alive = true;
    fetch(`https://discord.com/api/guilds/${guildId}/widget.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setGuild(j ?? null))
      .catch(() => alive && setGuild(null));
    return () => {
      alive = false;
    };
  }, [showGuild, guildId]);

  if (!showUser && !showGuild) return null;

  const status = STATUS[presence?.discord_status ?? "offline"] ?? STATUS["offline"]!;
  const activity = presence?.activities?.find((a) => a.type !== 4);
  const avatar = avatarUrl(user);
  const name = user?.global_name || user?.username || "Discord";

  return (
    <div className="mt-6 grid w-full max-w-md items-stretch gap-3 sm:grid-cols-2">
      {showUser && user && (
        <Shell accent={accent} className="p-4">
          <div className="relative flex items-center gap-3.5">
            <span className="relative shrink-0">
              <span
                className="absolute -inset-1 rounded-full opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-80"
                style={{ background: presence ? status.color : accent }}
                aria-hidden
              />
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="relative size-12 rounded-full object-cover ring-2 ring-white/10"
                  loading="lazy"
                />
              ) : (
                <span className="relative grid size-12 place-items-center rounded-full bg-white/10">
                  <SiDiscord className="size-6" style={{ color: accent }} />
                </span>
              )}
              {presence && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full"
                  style={{ background: "var(--p-surface, #0b0b12)" }}
                >
                  <span className="size-2.5 rounded-full" style={{ background: status.color }} />
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{name}</p>
              <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
              <p className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-[11px]">
                {presence ? (
                  <>
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: status.color }}
                      aria-hidden
                    />
                    <span className="truncate opacity-80">
                      {activity
                        ? `${activity.name}${activity.state ? ` · ${activity.state}` : ""}`
                        : status.label}
                    </span>
                  </>
                ) : (
                  <span className="truncate opacity-60">Perfil de Discord</span>
                )}
              </p>
            </div>

            <SiDiscord className="size-5 shrink-0 opacity-50 transition-opacity group-hover:opacity-90" />
          </div>
        </Shell>
      )}

      {showGuild && guild && (
        <Shell accent={accent} className="flex flex-col p-4">
          <div className="relative flex items-center gap-3">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-xl"
              style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)` }}
            >
              <SiDiscord className="size-5" style={{ color: accent }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{guild.name}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[#23a55a]" aria-hidden />
                  {guild.presence_count ?? 0} Online
                </span>
                {!!guild.members?.length && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" />
                    {guild.members.length}+ Miembros
                  </span>
                )}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[9px] font-semibold uppercase tracking-wider opacity-50">
              <SiDiscord className="size-3" />
              Discord
            </span>
          </div>

          <a
            href={guild.instant_invite ?? "#"}
            target="_blank"
            rel="noreferrer noopener"
            className="relative mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-transform duration-300 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #5865f2, #4752c4)",
              boxShadow: "0 12px 28px -14px #5865f2",
            }}
          >
            <SiDiscord className="size-4" />
            Unirse al servidor
            <ExternalLink className="size-3 opacity-70" />
          </a>
        </Shell>
      )}
    </div>
  );
}

export function ProfileDiscord({ theme }: { theme: ThemeConfig }) {
  const accent = theme.accent;
  const userId = (theme.discord_id ?? "").trim();
  const guildId = (theme.discord_server_id ?? "").trim();
  const showUser = userId.length > 5 && theme.discord_show_profile !== false;
  const showGuild = guildId.length > 5 && theme.discord_show_server !== false;

  const [presence, setPresence] = useState<Lanyard | null>(null);
  const [user, setUser] = useState<DUser | null>(null);
  const [guild, setGuild] = useState<Widget | null>(null);

  useEffect(() => {
    if (!showUser) {
      setPresence(null);
      setUser(null);
      return;
    }
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const j = r.ok ? await r.json() : null;
        if (alive && j?.success && j?.data) {
          setPresence(j.data as Lanyard);
          if (j.data.discord_user) setUser(j.data.discord_user as DUser);
          return;
        }
      } catch {
        /* ignore */
      }
      try {
        const r = await fetch(`https://dcdn.dstn.to/profile/${userId}`);
        const j = r.ok ? await r.json() : null;
        if (alive && j?.user) setUser(j.user as DUser);
      } catch {
        if (alive) setUser(null);
      }
    };
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [showUser, userId]);

  useEffect(() => {
    if (!showGuild) return setGuild(null);
    let alive = true;
    fetch(`https://discord.com/api/guilds/${guildId}/widget.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setGuild(j ?? null))
      .catch(() => alive && setGuild(null));
    return () => {
      alive = false;
    };
  }, [showGuild, guildId]);

  if (!showUser && !showGuild) return null;

  const status = STATUS[presence?.discord_status ?? "offline"] ?? STATUS["offline"]!;
  const activity = presence?.activities?.find((a) => a.type !== 4);
  const avatar = avatarUrl(user);
  const name = user?.global_name || user?.username || "Discord";

  return (
    <div className="mt-6 grid w-full max-w-md items-stretch gap-3 sm:grid-cols-2">
      {showUser && user && (
        <Shell accent={accent} className="p-4">
          <div className="relative flex items-center gap-3.5">
            <span className="relative shrink-0">
              <span
                className="absolute -inset-1 rounded-full opacity-50 blur-md transition-opacity duration-300 group-hover:opacity-80"
                style={{ background: presence ? status.color : accent }}
                aria-hidden
              />
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="relative size-12 rounded-full object-cover ring-2 ring-white/10"
                  loading="lazy"
                />
              ) : (
                <span className="relative grid size-12 place-items-center rounded-full bg-white/10">
                  <SiDiscord className="size-6" style={{ color: accent }} />
                </span>
              )}
              {presence && (
                <span
                  className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full"
                  style={{ background: "var(--p-surface, #0b0b12)" }}
                >
                  <span className="size-2.5 rounded-full" style={{ background: status.color }} />
                </span>
              )}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{name}</p>
              <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
              <p className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-[11px]">
                {presence ? (
                  <>
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: status.color }}
                      aria-hidden
                    />
                    <span className="truncate opacity-80">
                      {activity
                        ? `${activity.name}${activity.state ? ` · ${activity.state}` : ""}`
                        : status.label}
                    </span>
                  </>
                ) : (
                  <span className="truncate opacity-60">Perfil de Discord</span>
                )}
              </p>
            </div>

            <SiDiscord className="size-5 shrink-0 opacity-50 transition-opacity group-hover:opacity-90" />
          </div>
        </Shell>
      )}

      {showGuild && guild && (
        <a
          href={guild.instant_invite ?? "#"}
          target="_blank"
          rel="noreferrer noopener"
          className="block"
        >
          <Shell accent={accent} className="p-4 hover:-translate-y-0.5">
            <div className="relative flex items-center gap-3.5">
              <span
                className="grid size-12 shrink-0 place-items-center rounded-2xl"
                style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)` }}
              >
                <SiDiscord className="size-6" style={{ color: accent }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{guild.name}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-[#23a55a]" aria-hidden />
                  <Users className="size-3" />
                  {guild.presence_count ?? 0} en línea
                </p>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `color-mix(in oklab, ${accent} 22%, transparent)`,
                  color: accent,
                }}
              >
                Unirse
                <ExternalLink className="size-3" />
              </span>
            </div>
          </Shell>
        </a>
      )}
    </div>
  );
}
