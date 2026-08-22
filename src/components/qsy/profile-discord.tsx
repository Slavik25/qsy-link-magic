import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { lookupDiscord } from "@/lib/discord.functions";
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

type GuildMeta = {
  id?: string;
  icon?: string | null;
  banner?: string | null;
  approximate_member_count?: number;
  approximate_presence_count?: number;
  name?: string;
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

function guildIconUrl(id: string, icon?: string | null) {
  if (!icon) return null;
  const ext = icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${id}/${icon}.${ext}?size=128`;
}

function Shell({
  accent,
  children,
  className = "",
  transparent = false,
}: {
  accent: string;
  children: React.ReactNode;
  className?: string;
  transparent?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden border transition-all duration-300 ${className}`}
      style={{
        borderRadius: "var(--p-radius)",
        background: transparent ? "transparent" : "var(--p-surface)",
        backdropFilter: transparent ? "none" : "blur(var(--p-blur))",
        borderColor: `color-mix(in oklab, ${accent} ${transparent ? 18 : 28}%, transparent)`,
        boxShadow: transparent ? "none" : `0 10px 30px -18px ${accent}`,
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
  const transparent = theme.discord_transparent === true;
  const userId = (theme.discord_id ?? "").trim();
  const guildId = (theme.discord_server_id ?? "").trim();
  const invite = (theme.discord_invite ?? "").trim();
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
        if (alive && j?.user) {
          setUser(j.user as DUser);
          return;
        }
      } catch {
        /* ignore */
      }
      try {
        const r = await fetch(`https://discordlookup.mesalytic.moe/v1/user/${userId}`);
        const j = r.ok ? await r.json() : null;
        if (alive && j?.id) {
          setUser({
            id: j.id,
            username: j.username,
            global_name: j.global_name ?? null,
            avatar: j.avatar?.id ?? null,
          });
          return;
        }
      } catch {
        /* ignore */
      }
      if (alive) setUser((prev) => prev ?? { id: userId, username: "discord", avatar: null });
    };
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [showUser, userId]);

  const [guildMeta, setGuildMeta] = useState<GuildMeta | null>(null);

  useEffect(() => {
    if (!showGuild) {
      setGuild(null);
      setGuildMeta(null);
      return;
    }
    let alive = true;
    const run = async () => {
      let w: Widget | null = null;
      try {
        const r = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`);
        w = r.ok ? ((await r.json()) as Widget) : null;
      } catch {
        w = null;
      }
      if (!alive) return;
      setGuild(w);

      const code = w?.instant_invite?.split("/").pop();
      if (code) {
        try {
          const r = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
          const j = r.ok ? await r.json() : null;
          if (alive && j?.guild) {
            setGuildMeta({
              icon: j.guild.icon ?? null,
              banner: j.guild.banner ?? null,
              name: j.guild.name,
              approximate_member_count: j.approximate_member_count,
              approximate_presence_count: j.approximate_presence_count,
            });
            return;
          }
        } catch {
          /* ignore */
        }
      }
      try {
        const r = await fetch(`https://discordlookup.mesalytic.moe/v1/guild/${guildId}`);
        const j = r.ok ? await r.json() : null;
        if (alive && j?.id) {
          setGuildMeta({
            icon: j.icon?.id ?? null,
            banner: j.banner?.id ?? null,
            name: j.name,
            approximate_member_count: j.approximate_member_count,
            approximate_presence_count: j.approximate_presence_count,
          });
        }
      } catch {
        /* ignore */
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, [showGuild, guildId]);

  const doLookup = useServerFn(lookupDiscord);
  const { data: bot } = useQuery({
    queryKey: ["discord-lookup", userId, guildId, invite],
    queryFn: () =>
      doLookup({
        data: {
          userId: showUser ? userId : undefined,
          guildId: showGuild ? guildId : undefined,
          invite: showGuild ? invite || undefined : undefined,
        },
      }),
    enabled: showUser || showGuild,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (bot?.user) setUser((prev) => (prev?.avatar ? prev : (bot.user as DUser)));
    if (bot?.guild)
      setGuildMeta((prev) => ({
        ...prev,
        id: bot.guild!.id,
        icon: bot.guild!.icon,
        banner: bot.guild!.banner,
        name: bot.guild!.name,
      }));
  }, [bot]);

  if (!showUser && !showGuild) return null;

  const status = STATUS[presence?.discord_status ?? "offline"] ?? STATUS["offline"]!;
  const activity = presence?.activities?.find((a) => a.type !== 4);
  const avatar = avatarUrl(user);
  const name = user?.global_name || user?.username || "Discord";
  const guildIcon = guildIconUrl(guildMeta?.id ?? guildId, guildMeta?.icon);
  const memberCount = guildMeta?.approximate_member_count ?? guild?.members?.length ?? 0;

  return (
    <div className="mx-auto mt-6 grid w-full max-w-md items-stretch justify-center gap-3 sm:grid-cols-2">
      {showUser && (
        <Shell accent={accent} transparent={transparent} className="flex flex-col justify-center p-4">
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
              <p className="truncate text-xs text-muted-foreground">@{user?.username ?? "discord"}</p>
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

      {showGuild && (guild || guildMeta) && (
        <Shell accent={accent} transparent={transparent} className="flex flex-col p-4">
          <div className="relative flex items-center gap-3">
            {guildIcon ? (
              <img
                src={guildIcon}
                alt=""
                loading="lazy"
                className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-white/10"
              />
            ) : (
              <span
                className="grid size-11 shrink-0 place-items-center rounded-xl"
                style={{ background: `color-mix(in oklab, ${accent} 18%, transparent)` }}
              >
                <SiDiscord className="size-5" style={{ color: accent }} />
              </span>
            )}
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight">{guild?.name ?? guildMeta?.name ?? "Discord"}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-[#23a55a]" aria-hidden />
                  {guild?.presence_count ?? guildMeta?.approximate_presence_count ?? 0} Online
                </span>
                {!!memberCount && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="size-3" />
                    {memberCount}+ Miembros
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
            href={guild?.instant_invite || invite || `https://discord.gg/${guildId}`}
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
