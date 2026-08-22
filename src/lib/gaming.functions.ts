import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { loadSteam, loadTwitch, loadRoblox } from "./gaming.server";

const schema = z.object({
  steam: z.string().trim().max(64).optional(),
  twitch: z.string().trim().max(64).optional(),
  roblox: z.string().trim().max(64).optional(),
});

export type GamingAccount = {
  name: string;
  avatar: string | null;
  url: string;
  status?: string | null;
  stat?: { label: string; value: string } | null;
  live?: boolean;
};

export type GamingLookup = {
  steam: GamingAccount | null;
  twitch: GamingAccount | null;
  roblox: GamingAccount | null;
};

export const lookupGaming = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<GamingLookup> => {
    const [steam, twitch, roblox] = await Promise.all([
      data.steam ? loadSteam(data.steam) : Promise.resolve(null),
      data.twitch ? loadTwitch(data.twitch) : Promise.resolve(null),
      data.roblox ? loadRoblox(data.roblox) : Promise.resolve(null),
    ]);
    return { steam, twitch, roblox };
  });
