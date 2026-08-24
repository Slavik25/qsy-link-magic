import { useEffect, useRef, useState } from "react";
import { ProfileView } from "@/components/qsy/profile-view";
import { useProfileByUsername } from "@/lib/qsy-data";
import type { ThemeConfig } from "@/lib/qsy";

const BASE_WIDTH = 420;


const DEMO = {
  username: "qsy",
  display_name: "Tu nombre",
  bio: "Así se verá tu biolink con esta plantilla.",
  location: "",
  avatar_url: null as string | null,
  banner_url: null as string | null,
  verified: true,
};

const DEMO_LINKS = [
  { id: "d1", title: "Mi web", url: "https://qsy.rip", icon: "link" },
  { id: "d2", title: "Discord", url: "https://qsy.rip", icon: "discord" },
];

const DEMO_SOCIALS = [
  { id: "s1", platform: "instagram", url: "https://instagram.com" },
  { id: "s2", platform: "github", url: "https://github.com" },
];

/**
 * Vista previa automática del biolink con un tema dado.
 * Si se indica `username`, usa los datos públicos reales de ese perfil.
 */
export function TemplatePreview({
  theme,
  username,
  scale = 0.62,
  height = 260,
}: {
  theme: ThemeConfig;
  username?: string;
  scale?: number;
  height?: number;
}) {
  const { data } = useProfileByUsername(username ?? "");
  const base = username && data ? data.profile : null;

  const profile = {
    username: base?.username ?? DEMO.username,
    display_name: base?.display_name || DEMO.display_name,
    bio: base?.bio || DEMO.bio,
    location: base?.location ?? "",
    avatar_url: base?.avatar_url ?? null,
    banner_url: base?.banner_url ?? null,
    verified: base?.verified ?? DEMO.verified,
    theme,
  };

  const links = (base ? data?.links ?? [] : DEMO_LINKS).slice(0, 3).map((l) => ({
    id: l.id,
    title: l.title,
    url: l.url,
    icon: (l as { icon?: string }).icon ?? "link",
  }));
  const socials = (base ? data?.socials ?? [] : DEMO_SOCIALS).slice(0, 5).map((s) => ({
    id: s.id,
    platform: s.platform,
    url: s.url,
  }));

  const wrap = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState(scale);
  const [innerH, setInnerH] = useState(0);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setFit(Math.min(1, w / BASE_WIDTH));
      if (inner.current) setInnerH(inner.current.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);

  const boxHeight = innerH > 0 ? Math.round(innerH * fit) : height;

  return (
    <div
      ref={wrap}
      className="relative w-full overflow-hidden rounded-2xl border border-border/60"
      style={{
        height: boxHeight,
        background: `radial-gradient(90% 70% at 50% 0%, ${theme.accent}33, transparent 70%), #0a0a0a`,
      }}
    >

      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{ width: BASE_WIDTH, transform: `scale(${fit})` }}
      >
        <div ref={inner}>
          <ProfileView
            profile={profile}
            links={links}
            socials={socials}
            badges={[]}
            views={1280}
            likes={64}
            compact
          />
        </div>
      </div>
    </div>
  );
}

