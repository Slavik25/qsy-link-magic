import { getRequest } from "@tanstack/react-start/server";

/** IP real del visitante detrás del proxy/CDN. */
export function requestIp(): string | null {
  try {
    const h = getRequest().headers;
    const raw =
      h.get("cf-connecting-ip") ||
      h.get("x-real-ip") ||
      (h.get("x-forwarded-for") ?? "").split(",")[0] ||
      "";
    const ip = raw.trim();
    return ip ? ip.slice(0, 64) : null;
  } catch {
    return null;
  }
}

export function requestUserAgent(): string | null {
  try {
    return (getRequest().headers.get("user-agent") ?? "").slice(0, 300) || null;
  } catch {
    return null;
  }
}
