import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { ProfileView } from "@/components/qsy/profile-view";
import { ProfileStage } from "@/components/qsy/profile-stage";
import { ProfileWall } from "@/components/qsy/profile-wall";

import { QsyLogo } from "@/components/qsy/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfileByUsername } from "@/lib/qsy-data";
import { detectBrowser, detectDevice } from "@/lib/qsy";
import { getProfileMeta } from "@/lib/profile-meta.functions";

export const Route = createFileRoute("/$username")({
  loader: async ({ params }) => {
    try {
      return { meta: await getProfileMeta({ data: { username: params.username } }) };
    } catch {
      return { meta: null };
    }
  },
  head: ({ params, loaderData }) => {
    const m = loaderData?.meta ?? null;
    const handle = `@${m?.username ?? params.username}`;
    const name = m?.display_name || handle;

    // Embed por defecto de QSY; los rangos Obsidian y Seraph pueden sobrescribirlo.
    const title =
      m?.meta_title ?? (name === handle ? `${handle} · qsy.rip` : `${name} (${handle}) · qsy.rip`);
    const description =
      m?.meta_description ??
      (m?.bio?.trim() ? m.bio.trim() : `${handle} en QSY — links, redes y música en un solo perfil.`);
    // Imagen del embed: override premium → avatar del perfil → tarjeta QSY por defecto.
    const image = m?.meta_image ?? m?.avatar_url ?? "https://qsy.rip/og-default.png";
    const largeCard = !m?.meta_image && !m?.avatar_url;


    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:site_name", content: "qsy.rip · perfil de usuario" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: `https://qsy.rip/${m?.username ?? params.username}` },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "theme-color", content: "#7c5cff" },
        { property: "og:image", content: image },
        ...(largeCard
          ? [
              { property: "og:image:width", content: "1200" },
              { property: "og:image:height", content: "630" },
            ]
          : []),
        { name: "twitter:image", content: image },
        { name: "twitter:card", content: largeCard ? "summary_large_image" : "summary" },

      ],

      links: m?.meta_favicon ? [{ rel: "icon", href: m.meta_favicon }] : [],
    };
  },
  errorComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center text-sm text-muted-foreground">
      No pudimos cargar este perfil. Vuelve a intentarlo en unos segundos.
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-4 text-center text-sm text-muted-foreground">
      Este perfil no existe.
    </div>
  ),
  component: PublicProfile,
});


function PublicProfile() {
  const { username } = Route.useParams();
  const { data, isLoading } = useProfileByUsername(username);
  const tracked = useRef(false);

  const profileId = data?.profile.id;
  useEffect(() => {
    if (!profileId || tracked.current) return;
    tracked.current = true;
    const key = `qsy_viewed_${profileId}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, String(Date.now()));
    } catch {
      /* storage bloqueado: registramos igual */
    }
    supabase
      .from("profile_views")
      .insert({
        profile_id: profileId,
        device: detectDevice(),
        browser: detectBrowser(),
        referrer: document.referrer || "direct",
        country: null,
      })
      .then(({ error }) => {
        if (error) {
          // Si el registro falla no marcamos la visita, para reintentarlo luego.
          try {
            localStorage.removeItem(key);
          } catch {
            /* noop */
          }
          tracked.current = false;
        }
      });

  }, [profileId]);



  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Cargando perfil…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <QsyLogo />
          <h1 className="mt-6 text-2xl font-semibold">@{username} no existe</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este usuario aún no ha reclamado su QSY.
          </p>
          <Button asChild className="mt-6">
            <Link to="/register">Reclamar este link</Link>
          </Button>
        </div>
      </div>
    );
  }




  const { profile, links, socials, badges, views, likes } = data;
  const music = profile.music as { title?: string; artist?: string };
  const widthClass =
    profile.theme.profile_width === "compact"
      ? "max-w-md"
      : profile.theme.profile_width === "wide"
        ? "max-w-3xl"
        : "max-w-xl";

  // CSS personalizado: exclusivo de Obsidian y Seraph.
  const premium = profile.rank === "obsidian" || profile.rank === "seraph";
  const customCss = premium ? (profile.theme.custom_css ?? "").trim() : "";

  return (
    <ProfileStage theme={profile.theme} music={music}>
      {customCss ? <style dangerouslySetInnerHTML={{ __html: customCss }} /> : null}
      <ProfileWall profileId={profile.id} accent={profile.theme.accent} />
      <main
        className={`mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 ${widthClass}`}
      >



        <ProfileView
          profileId={profile.id}
          profile={profile}
          links={links}
          socials={socials}
          badges={badges}
          views={views}
          likes={likes}
          music={music}
          onLinkClick={(l) => {
            supabase
              .from("link_clicks")
              .insert({
                profile_id: profile.id,
                link_id: l.id,
                label: l.title,
                device: detectDevice(),
                referrer: document.referrer || "direct",
                country: null,
              })
              .then(() => undefined);

          }}
        />
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="rounded-full glass px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Creado con QSY
          </Link>
        </div>
      </main>
    </ProfileStage>
  );
}
