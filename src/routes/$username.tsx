import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ProfileView } from "@/components/qsy/profile-view";
import { ProfileStage } from "@/components/qsy/profile-stage";
import { ProfileWall } from "@/components/qsy/profile-wall";

import { QsyLogo } from "@/components/qsy/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useProfileByUsername } from "@/lib/qsy-data";
import { detectBrowser, detectDevice } from "@/lib/qsy";
import { hostDomain, profileHost, profileUrl } from "@/lib/domains";


export const Route = createFileRoute("/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — QSY` },
      { name: "description", content: `Perfil QSY de @${params.username}: links, redes y música.` },
      { property: "og:title", content: `@${params.username} — QSY` },
      { property: "og:description", content: `Perfil QSY de @${params.username}.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
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
    void supabase.from("profile_views").insert({
      profile_id: profileId,
      device: detectDevice(),
      browser: detectBrowser(),
      referrer: document.referrer || "direct",
      country: null,
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

  return (
    <ProfileStage theme={profile.theme} music={music}>
      <ProfileWall profileId={profile.id} accent={profile.theme.accent} />
      <main
        className={`mx-auto flex min-h-screen w-full flex-col items-center justify-center px-4 py-10 ${widthClass}`}
      >



        <ProfileView
          profile={profile}
          links={links}
          socials={socials}
          badges={badges}
          views={views}
          likes={likes}
          music={music}
          onLinkClick={(l) => {
            void supabase.from("link_clicks").insert({
              profile_id: profile.id,
              link_id: l.id,
              label: l.title,
              device: detectDevice(),
              referrer: document.referrer || "direct",
              country: null,
            });
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
