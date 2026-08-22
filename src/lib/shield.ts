/**
 * Escudo básico de QSY: bloquea escáneres, payloads de inyección y abuso de
 * peticiones antes de que lleguen al render. Cualquier bloqueo devuelve el
 * mismo mensaje, sin filtrar detalles internos.
 */

const BLOCK_MESSAGE = "que haces pendejo virgo\n";

/** Rutas típicas de escáneres automáticos que esta app nunca sirve. */
const SCANNER_PATHS = [
  /^\/wp-(admin|login|content|includes)/i,
  /^\/(xmlrpc\.php|wp-config\.php|\.env|\.env\.[a-z]+|\.git|\.svn|\.aws|\.ssh)\b/i,
  /^\/(phpmyadmin|pma|adminer|myadmin|mysql|cgi-bin|vendor|config\.json|backup|dump\.sql)/i,
  /\.(php|asp|aspx|jsp|cgi|sh|bak|old|sql|env)$/i,
  /^\/actuator|^\/solr|^\/druid|^\/telescope|^\/debug\b/i,
];

/** Payloads clásicos de inyección / traversal en la URL. */
const MALICIOUS_QUERY = [
  /(\.\.\/|\.\.%2f|%2e%2e%2f)/i,
  /<script\b|%3cscript|javascript:/i,
  /\bunion\s+(all\s+)?select\b|\bselect\b.+\bfrom\b.+\bwhere\b|\bdrop\s+table\b|\bsleep\s*\(/i,
  /\b(or|and)\s+1\s*=\s*1\b/i,
  /\$\{jndi:/i,
  /\bonerror\s*=|\bonload\s*=/i,
];

/** Ventana simple en memoria por IP (best-effort, por instancia). */
const WINDOW_MS = 10_000;
const MAX_REQUESTS = 150;
const hits = new Map<string, { count: number; reset: number }>();

function clientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function rateLimited(request: Request): boolean {
  const ip = clientIp(request);
  if (ip === "unknown") return false;
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + WINDOW_MS });
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now > value.reset) hits.delete(key);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_REQUESTS;
}

function blocked(status: number, retryAfter?: number): Response {
  return new Response(BLOCK_MESSAGE, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex, nofollow",
      ...(retryAfter ? { "retry-after": String(retryAfter) } : {}),
    },
  });
}

/** Devuelve una respuesta de bloqueo, o null si la petición es legítima. */
export function shieldRequest(request: Request): Response | null {
  const url = new URL(request.url);
  const path = decodeURIComponent(url.pathname);
  const target = `${path}${url.search}`;

  if (!["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(request.method)) {
    return blocked(405);
  }
  if (path.length > 512 || url.search.length > 2048) return blocked(414);
  if (SCANNER_PATHS.some((re) => re.test(path))) return blocked(403);
  if (MALICIOUS_QUERY.some((re) => re.test(target))) return blocked(403);
  if (rateLimited(request)) return blocked(429, 10);

  return null;
}

/** Cabeceras de seguridad aplicadas a toda respuesta que sale del servidor. */
export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("x-frame-options", "SAMEORIGIN");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "geolocation=(), microphone=(), camera=(), payment=()");
  headers.set("cross-origin-opener-policy", "same-origin");
  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  if (!headers.has("x-robots-tag")) headers.set("x-robots-tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
