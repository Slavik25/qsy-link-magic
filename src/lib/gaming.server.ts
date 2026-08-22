export type GamingAccount = {
  name: string;
  avatar: string | null;
  url: string;
  status?: string | null;
  stat?: { label: string; value: string } | null;
  live?: boolean;
};

async function safeText(url: string) {
  try {
    const r = await fetch(url, { headers: { "user-agent": "qsy-biolink" } });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

async function safeJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const r = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

function tag(xml: string, name: string) {
  const m = xml.match(new RegExp(`<${name}>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${name}>`));
  return m?.[1]?.trim() || null;
}

export async function loadSteam(id: string): Promise<GamingAccount | null> {
  const clean = id.replace(/^https?:\/\/steamcommunity\.com\/(id|profiles)\//i, "").replace(/\/+$/, "");
  if (!/^[\w.-]{2,64}$/.test(clean)) return null;
  const path = /^\d{17}$/.test(clean) ? `profiles/${clean}` : `id/${clean}`;
  const xml = await safeText(`https://steamcommunity.com/${path}?xml=1`);
  const url = `https://steamcommunity.com/${path}`;
  if (!xml) return { name: clean, avatar: null, url };
  const state = tag(xml, "stateMessage");
  return {
    name: tag(xml, "steamID") ?? clean,
    avatar: tag(xml, "avatarFull"),
    url,
    status: state ? state.replace(/<[^>]+>/g, "") : null,
    stat: tag(xml, "memberSince") ? { label: "Miembro desde", value: tag(xml, "memberSince")! } : null,
  };
}

export async function loadTwitch(user: string): Promise<GamingAccount | null> {
  const clean = user.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "").replace(/\/+$/, "");
  if (!/^[\w]{3,25}$/.test(clean)) return null;
  const [avatar, followers, uptime] = await Promise.all([
    safeText(`https://decapi.me/twitch/avatar/${clean}`),
    safeText(`https://decapi.me/twitch/followcount/${clean}`),
    safeText(`https://decapi.me/twitch/uptime/${clean}`),
  ]);
  const live = !!uptime && !/offline|error|not/i.test(uptime);
  const followCount = followers && /^\d+$/.test(followers.trim()) ? Number(followers.trim()) : null;
  return {
    name: clean,
    avatar: avatar && avatar.startsWith("http") ? avatar.trim() : null,
    url: `https://twitch.tv/${clean}`,
    status: live ? `En directo · ${uptime!.trim()}` : "Offline",
    live,
    stat: followCount !== null ? { label: "Seguidores", value: followCount.toLocaleString() } : null,
  };
}

export async function loadRoblox(user: string): Promise<GamingAccount | null> {
  const clean = user.replace(/^https?:\/\/(www\.)?roblox\.com\/users\//i, "").replace(/\/profile\/?$/, "");
  if (!/^[\w.]{3,25}$/.test(clean)) return null;

  let id: number | null = /^\d+$/.test(clean) ? Number(clean) : null;
  let name = clean;
  let display = clean;

  if (id === null) {
    const res = await safeJson<{ data?: { id: number; name: string; displayName: string }[] }>(
      "https://users.roblox.com/v1/usernames/users",
      { method: "POST", body: JSON.stringify({ usernames: [clean], excludeBannedUsers: true }) },
    );
    const hit = res?.data?.[0];
    if (!hit) return { name: clean, avatar: null, url: `https://roblox.com/search/users?keyword=${clean}` };
    id = hit.id;
    name = hit.name;
    display = hit.displayName || hit.name;
  } else {
    const info = await safeJson<{ name: string; displayName: string }>(`https://users.roblox.com/v1/users/${id}`);
    if (info) {
      name = info.name;
      display = info.displayName || info.name;
    }
  }

  const [thumb, friends] = await Promise.all([
    safeJson<{ data?: { imageUrl: string }[] }>(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=150x150&format=Png&isCircular=false`,
    ),
    safeJson<{ count: number }>(`https://friends.roblox.com/v1/users/${id}/friends/count`),
  ]);

  return {
    name: display,
    avatar: thumb?.data?.[0]?.imageUrl ?? null,
    url: `https://www.roblox.com/users/${id}/profile`,
    status: `@${name}`,
    stat: friends ? { label: "Amigos", value: String(friends.count) } : null,
  };
}

