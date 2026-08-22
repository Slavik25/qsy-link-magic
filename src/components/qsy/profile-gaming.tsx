import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink } from "lucide-react";
import { SiSteam, SiTwitch, SiRoblox } from "react-icons/si";
import { lookupGaming, type GamingAccount } from "@/lib/gaming.functions";
import type { ThemeConfig } from "@/lib/qsy";

const BRAND = {
  steam: { label: "Steam", color: "#66c0f4", Icon: SiSteam },
  twitch: { label: "Twitch", color: "#9146ff", Icon: SiTwitch },
  roblox: { label: "Roblox", color: "#e2231a", Icon: SiRoblox },
} as const;

type Key = keyof typeof BRAND;

function Card({
  brand,
  account,
  accent,
  transparent,
}: {
  brand: Key;
  account: GamingAccount;
  accent: string;
  transparent: boolean;
}) {
  const { label, color, Icon } = BRAND[brand];
  return (
    <a
      href={account.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group relative flex items-center gap-3 overflow-hidden p-3 transition-transform duration-300 hover:-translate-y-0.5"
      style={{
        borderRadius: "var(--p-radius)",
        border: transparent ? "0" : `1px solid color-mix(in oklab, ${color} 35%, transparent)`,
        background: transparent ? "transparent" : "var(--p-surface)",
        backdropFilter: transparent ? "none" : "blur(var(--p-blur))",
        boxShadow: transparent ? "none" : `0 12px 34px -20px ${color}`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-10 size-24 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <span className="relative shrink-0">
        {account.avatar ? (
          <img
            src={account.avatar}
            alt={`${label} · ${account.name}`}
            loading="lazy"
            className="size-11 rounded-xl object-cover ring-1"
            style={{ boxShadow: `0 0 0 1px color-mix(in oklab, ${color} 45%, transparent)` }}
          />
        ) : (
          <span
            className="grid size-11 place-items-center rounded-xl"
            style={{ background: `color-mix(in oklab, ${color} 22%, transparent)`, color }}
          >
            <Icon className="size-5" />
          </span>
        )}
        {account.live && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#e91916] px-1.5 py-px text-[8px] font-bold uppercase tracking-wider text-white">
            live
          </span>
        )}
      </span>

      <span className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color }}>
          <Icon className="size-3" /> {label}
        </span>
        <span className="block truncate text-sm font-semibold" style={{ color: "var(--p-text, inherit)" }}>
          {account.name}
        </span>
        {account.status && (
          <span className="block truncate text-[11px] opacity-70">{account.status}</span>
        )}
      </span>

      {account.stat && (
        <span className="hidden shrink-0 text-right sm:block">
          <span className="block text-sm font-bold" style={{ color: accent }}>
            {account.stat.value}
          </span>
          <span className="block text-[10px] uppercase tracking-wider opacity-60">
            {account.stat.label}
          </span>
        </span>
      )}

      <ExternalLink className="size-3.5 shrink-0 opacity-40 transition-opacity group-hover:opacity-90" />
    </a>
  );
}

export function ProfileGaming({ theme }: { theme: ThemeConfig }) {
  const steam = (theme.steam_id ?? "").trim();
  const twitch = (theme.twitch_user ?? "").trim();
  const roblox = (theme.roblox_user ?? "").trim();
  const enabled = theme.gaming_enabled !== false && (!!steam || !!twitch || !!roblox);
  const lookup = useServerFn(lookupGaming);

  const { data } = useQuery({
    queryKey: ["gaming", steam, twitch, roblox],
    enabled,
    staleTime: 60_000,
    queryFn: () => lookup({ data: { steam, twitch, roblox } }),
  });

  if (!enabled) return null;
  const entries: [Key, GamingAccount | null | undefined][] = [
    ["steam", steam ? data?.steam : null],
    ["twitch", twitch ? data?.twitch : null],
    ["roblox", roblox ? data?.roblox : null],
  ];
  const visible = entries.filter(([, a]) => a) as [Key, GamingAccount][];
  if (visible.length === 0) return null;

  return (
    <div className="mt-4 grid w-full gap-2 sm:grid-cols-2">
      {visible.map(([key, account]) => (
        <Card
          key={key}
          brand={key}
          account={account}
          accent={theme.accent}
          transparent={theme.gaming_transparent === true}
        />
      ))}
    </div>
  );
}
