import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import type { ThemeConfig } from "@/lib/qsy";

type Lanyard = {
  discord_user?: { id: string; username: string; global_name?: string | null; avatar?: string | null };
  discord_status?: "online" | "idle" | "dnd" | "offline";
  activities?: { id: string; name: string; type: number; state?: string; details?: string }[];
};

type Widget = {
  id: string;
  name: string;
  instant_invite?: string | null;
  presence_count?: number;
  members?: { id: string; username: string; avatar_url?: string; status?: string }[];
};

const STATUS: Record<string, { label: string; color: string }> = {
  online: { label: "En línea", color: "#22c55e" },
  idle: { label: "Ausente", color: "#eab308" },
  dnd: { label: "No molestar", color: "#ef4444" },
  offline: { label: "Desconectado", color: "#6b7280" },
};

function Card({
  accent,
  children,
}: {
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex w-full items-center gap-3 border px-4 py-3 text-left"
      style={{
        borderRadius: "var(--p-radius)",
        background: "var(--p-surface)",
        backdropFilter: "blur(var(--p-blur))",
        borderColor: `color-mix(in oklab, ${accent} 25%, transparent)`,
      }}
    >
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

  const [user, setUser] = useState<Lanyard | null>(null);
  const [guild, setGuild] = useState<Widget | null>(null);

  useEffect(() => {
    if (!showUser) return setUser(null);
    let alive = true;
    fetch(`https://api.lanyard.rest/v1/users/${userId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => alive && setUser(j?.data ?? null))
      .catch(() => alive && setUser(null));
    return () => {
      alive = false;
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

  const du = user?.discord_user;
  const status = STATUS[user?.discord_status ?? "offline"];
  const activity = user?.activities?.find((a) => a.type !== 4);
  const avatar = du?.avatar
    ? `https://cdn.discordapp.com/avatars/${du.id}/${du.avatar}.${du.avatar.startsWith("a_") ? "gif" : "png"}?size=128`
    : null;

  return (
    <div className="mt-6 w-full max-w-md space-y-3">
      {showUser && du && (
        <Card accent={accent}>
          <span className="relative shrink-0">
            {avatar ? (
              <img src={avatar} alt="" className="size-10 rounded-full object-cover" loading="lazy" />
            ) : (
              <span className="grid size-10 place-items-center rounded-full bg-white/10">
                <SiDiscord className="size-5" style={{ color: accent }} />
              </span>
            )}
            <span
              className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-[#0b0b12]"
              style={{ background: status.color }}
              aria-hidden
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{du.global_name || du.username}</p>
            <p className="truncate text-xs text-muted-foreground">
              {activity ? `${activity.name}${activity.state ? ` · ${activity.state}` : ""}` : status.label}
            </p>
          </div>
          <SiDiscord className="size-4 shrink-0 opacity-60" />
        </Card>
      )}

      {showGuild && guild && (
        <a
          href={guild.instant_invite ?? `https://discord.gg/`}
          target="_blank"
          rel="noreferrer noopener"
          className="block lift"
        >
          <Card accent={accent}>
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
              <SiDiscord className="size-5" style={{ color: accent }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{guild.name}</p>
              <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" />
                {guild.presence_count ?? 0} en línea
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold" style={{ color: accent }}>
              Unirse
            </span>
          </Card>
        </a>
      )}
    </div>
  );
}
