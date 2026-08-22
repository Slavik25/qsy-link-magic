import { createFileRoute } from "@tanstack/react-router";
import { ImageResponse, loadGoogleFont } from "workers-og";
import { getProfileMeta } from "@/lib/profile-meta.functions";

/** Nodo satori sin JSX (este archivo es .ts y corre en el edge). */
type Node = { type: string; props: Record<string, unknown> };
const el = (type: string, props: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { ...props, ...(children.length ? { children: children.filter(Boolean) } : {}) },
});

const BG = "#08080c";
const VIOLET = "#8b7bff";

function card(m: {
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string | null;
}) {
  const initial = (m.display_name || m.username || "Q").charAt(0).toUpperCase();
  const bio = m.bio.length > 120 ? `${m.bio.slice(0, 117)}…` : m.bio;

  const avatar = m.avatar_url
    ? el("img", {
        src: m.avatar_url,
        width: 190,
        height: 190,
        style: {
          width: "190px",
          height: "190px",
          borderRadius: "999px",
          objectFit: "cover",
          border: `3px solid ${VIOLET}`,
        },
      })
    : el(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "190px",
            height: "190px",
            borderRadius: "999px",
            border: `3px solid ${VIOLET}`,
            background: "#15121f",
            color: "#ffffff",
            fontSize: "84px",
          },
        },
        initial,
      );

  return el(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        background: BG,
        backgroundImage:
          "radial-gradient(circle at 82% 12%, rgba(124,92,255,0.28), transparent 45%), radial-gradient(circle at 8% 78%, rgba(124,92,255,0.16), transparent 45%)",
        padding: "70px",
        justifyContent: "space-between",
        fontFamily: "Inter",
      },
    },
    el(
      "div",
      { style: { display: "flex", alignItems: "center", gap: "56px", marginTop: "40px" } },
      avatar,
      el(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        el(
          "div",
          { style: { display: "flex", fontSize: "68px", color: "#ffffff", lineHeight: 1.1 } },
          m.display_name || m.username,
        ),
        el(
          "div",
          { style: { display: "flex", fontSize: "30px", color: VIOLET, marginTop: "14px" } },
          `@${m.username}`,
        ),
        bio
          ? el(
              "div",
              {
                style: {
                  display: "flex",
                  fontSize: "26px",
                  color: "#9b9ba7",
                  marginTop: "22px",
                  maxWidth: "740px",
                },
              },
              bio,
            )
          : null,
      ),
    ),
    el(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      el("div", { style: { display: "flex", height: "1px", background: "#26262e" } }),
      el(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "26px",
          },
        },
        el("div", { style: { display: "flex", fontSize: "26px", color: "#c9c9d4" } }, "qsy.rip"),
        el(
          "div",
          { style: { display: "flex", fontSize: "22px", color: "#6d6d7a" } },
          "perfil de usuario",
        ),
      ),
    ),
  );
}

export const Route = createFileRoute("/api/public/og/$username")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const username = String(params.username ?? "").toLowerCase();
        let meta: Awaited<ReturnType<typeof getProfileMeta>> = null;
        try {
          meta = await getProfileMeta({ data: { username } });
        } catch {
          meta = null;
        }

        const data = {
          display_name: meta?.display_name || username,
          username: meta?.username || username,
          bio: meta?.bio ?? "",
          avatar_url: meta?.avatar_url ?? null,
        };

        try {
          const text = `${data.display_name}@${data.username}${data.bio}qsy.rip perfil de usuario`;
          const [regular, bold] = await Promise.all([
            loadGoogleFont({ family: "Inter", weight: 400, text }),
            loadGoogleFont({ family: "Inter", weight: 700, text }),
          ]);

          return new ImageResponse(card(data) as unknown as React.ReactNode, {
            width: 1200,
            height: 630,
            format: "png",
            fonts: [
              { name: "Inter", data: regular, weight: 400, style: "normal" },
              { name: "Inter", data: bold, weight: 700, style: "normal" },
            ],
            headers: {
              "cache-control": "public, max-age=300, s-maxage=300",
            },
          } as never);
        } catch (err) {
          console.error("og render failed", err);
          return new Response("og unavailable", { status: 500 });
        }
      },
    },
  },
});
