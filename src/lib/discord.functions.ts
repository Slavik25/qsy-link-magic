import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  userId: z.string().trim().max(32).optional(),
  guildId: z.string().trim().max(32).optional(),
  invite: z.string().trim().max(120).optional(),
});

export type DiscordLookup = {
  user: { id: string; username: string; global_name: string | null; avatar: string | null; banner: string | null } | null;
  guild: { id: string; name: string; icon: string | null; banner: string | null } | null;
  configured: boolean;
};

export const lookupDiscord = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<DiscordLookup> => {
    const token = process.env["DISCORD_BOT_TOKEN"];
    if (!token) return { user: null, guild: null, configured: false };

    const headers = { Authorization: `Bot ${token}` };
    const get = async (path: string) => {
      try {
        const r = await fetch(`https://discord.com/api/v10${path}`, { headers });
        if (!r.ok) return null;
        return (await r.json()) as Record<string, unknown>;
      } catch {
        return null;
      }
    };

    const [u, g] = await Promise.all([
      data.userId && /^\d{5,25}$/.test(data.userId) ? get(`/users/${data.userId}`) : null,
      data.guildId && /^\d{5,25}$/.test(data.guildId) ? get(`/guilds/${data.guildId}`) : null,
    ]);

    let guild = g;
    if (!guild && data.invite) {
      const code = data.invite.split("?")[0]!.split("/").filter(Boolean).pop();
      if (code && /^[\w-]{2,32}$/.test(code)) {
        try {
          const r = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`);
          const j = r.ok ? ((await r.json()) as Record<string, unknown>) : null;
          if (j?.["guild"]) guild = j["guild"] as Record<string, unknown>;
        } catch {
          /* ignore */
        }
      }
    }

    return {
      configured: true,
      user: u
        ? {
            id: String(u["id"]),
            username: String(u["username"] ?? ""),
            global_name: (u["global_name"] as string | null) ?? null,
            avatar: (u["avatar"] as string | null) ?? null,
            banner: (u["banner"] as string | null) ?? null,
          }
        : null,
      guild: guild
        ? {
            id: String(guild["id"]),
            name: String(guild["name"] ?? ""),
            icon: (guild["icon"] as string | null) ?? null,
            banner: (guild["banner"] as string | null) ?? null,
          }
        : null,
    };
  });
