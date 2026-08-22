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
  // Rutas reservadas que jamás son usuarios ni páginas reales.
  /^\/(shell|cmd|console|config|configs|logs|log|temp|tmp|uploads|upload|files|server-status|webshell|c99|r57|admin\.php)(\/|$)/i,
  /^\/(admin|administrator|api|v1|v2|graphql|manager|owa|jenkins|kibana)$/i,

];


/** Payloads clásicos de inyección / traversal en la URL. */
const MALICIOUS_QUERY = [
  /(\.\.\/|\.\.%2f|%2e%2e%2f|\.\.\\|%5c\.\.)/i,
  /<script\b|%3cscript|javascript:|data:text\/html/i,
  /\bunion\s+(all\s+)?select\b|\bselect\b.+\bfrom\b.+\bwhere\b|\bdrop\s+table\b|\bsleep\s*\(|\bbenchmark\s*\(|\bxp_cmdshell\b|\bwaitfor\s+delay\b/i,
  /\b(or|and)\s+1\s*=\s*1\b/i,
  /\$\{jndi:|\$\{\s*(env|sys|lower|upper)\s*:/i,
  /\bon(error|load|click|mouseover)\s*=/i,
  /\{\{.*(constructor|__proto__|process|require).*\}\}/i,
  /__proto__|constructor\[?['"]?prototype/i,
];

/**
 * Ejecución remota de comandos: PowerShell, cmd.exe, bash y descargas remotas.
 * Se evalúa sobre la query, headers y cuerpos crudos, nunca sobre el pathname
 * limpio, para no bloquear nombres de usuario legítimos.
 */
const COMMAND_INJECTION = [
  /\bpowershell(\.exe)?\b|\bpwsh\b|\bcmd(\.exe)?\s*\/c\b/i,
  /-(enc|encodedcommand|nop|noprofile|noni|noninteractive|w\s+hidden|windowstyle\s+hidden|exec\s+bypass)\b/i,
  /\b(iex|invoke-expression|invoke-webrequest|invoke-shellcode|downloadstring|downloadfile|start-process|new-object\s+net\.webclient|frombase64string)\b/i,
  /\b(certutil|bitsadmin|mshta|regsvr32|rundll32|wmic|schtasks|net\s+user|vssadmin)\b/i,
  /\b(wget|curl)\s+(https?|ftp):\/\//i,
  /\b(bash|sh|zsh)\s+-c\b|\/bin\/(ba)?sh\b|\bnc\s+-e\b|\bchmod\s+\+x\b/i,
  /[;|&`]\s*(cat|ls|id|whoami|uname|ping|nslookup|curl|wget)\b/i,
  /\$\(.*\)|`[^`]{2,}`/,
  /%0a|%0d|\r\n/i,
];

/** User-agents de herramientas de escaneo/explotación conocidas. */
const BAD_AGENTS =
  /(sqlmap|nikto|nmap|masscan|acunetix|nessus|openvas|zgrab|dirbuster|gobuster|feroxbuster|wpscan|hydra|metasploit|nuclei|havij|xsser|commix|whatweb|joomscan|arachni|zaproxy|burpsuite|python-requests\/|curl\/7\.(1|2)\d|libwww-perl|go-http-client)/i;


/** Ventana simple en memoria por IP (best-effort, por instancia). */
const WINDOW_MS = 10_000;
const MAX_REQUESTS = 600;
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

/** Assets y módulos del bundle: no cuentan para el límite. */
const ASSET_PATH =
  /^\/(@|src\/|node_modules\/|_build\/|assets\/|__l5e\/|favicon|badges\/)|\.(js|mjs|css|map|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|json|txt|xml)$/i;

function rateLimited(request: Request, path: string): boolean {
  if (ASSET_PATH.test(path)) return false;
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

/** Headers que suelen usarse para inyectar comandos o envenenar el host. */
const RISKY_HEADERS = [
  "user-agent",
  "referer",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-original-url",
  "x-rewrite-url",
  "cookie",
];

/** Devuelve una respuesta de bloqueo, o null si la petición es legítima. */
export function shieldRequest(request: Request): Response | null {
  const url = new URL(request.url);
  const path = decodeURIComponent(url.pathname);
  let query = url.search;
  try {
    query = decodeURIComponent(url.search);
  } catch {
    return blocked(400);
  }
  const target = `${path}${query}`;

  if (!["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"].includes(request.method)) {
    return blocked(405);
  }
  if (path.length > 512 || url.search.length > 2048) return blocked(414);
  if (SCANNER_PATHS.some((re) => re.test(path))) return blocked(403);
  if (MALICIOUS_QUERY.some((re) => re.test(target))) return blocked(403);
  if (COMMAND_INJECTION.some((re) => re.test(query))) return blocked(403);

  const agent = request.headers.get("user-agent") ?? "";
  if (BAD_AGENTS.test(agent)) return blocked(403);

  for (const name of RISKY_HEADERS) {
    const value = request.headers.get(name);
    if (!value) continue;
    if (value.length > 4096) return blocked(431);
    if (COMMAND_INJECTION.some((re) => re.test(value))) return blocked(403);
    if (MALICIOUS_QUERY.some((re) => re.test(value))) return blocked(403);
  }

  if (rateLimited(request, path)) return blocked(429, 10);

  return null;
}


/** Orígenes que sí pueden embeber la app (editor/preview de Lovable). */
const FRAME_ANCESTORS = "'self' https://*.lovable.app https://*.lovable.dev https://lovable.dev";

function buildCsp(strict: boolean): string {
  return [
    "default-src 'self'",
    // En producción no se permite eval/new Function: los payloads pegados en la
    // consola que usan eval, Function() o import() dinámico quedan bloqueados.
    strict
      ? "script-src 'self' 'unsafe-inline' https:"
      : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https:",
    "media-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    `frame-ancestors ${FRAME_ANCESTORS}`,
  ].join("; ");
}

/** Solo los dominios públicos reales llevan la política estricta. */
function strictHost(request?: Request): boolean {
  if (!request) return false;
  try {
    const host = new URL(request.url).hostname;
    if (host.includes("lovable.app") || host.includes("lovable.dev")) return false;
    if (host === "localhost" || host === "127.0.0.1") return false;
    return true;
  } catch {
    return false;
  }
}

/** Cabeceras de seguridad aplicadas a toda respuesta que sale del servidor. */
export function withSecurityHeaders(response: Response, request?: Request): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "geolocation=(), microphone=(), camera=(), payment=()");
  headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
  headers.set("x-xss-protection", "1; mode=block");
  headers.set("cross-origin-opener-policy", "same-origin-allow-popups");
  headers.set("cross-origin-resource-policy", "cross-origin");

  headers.set("content-security-policy", buildCsp(strictHost(request)));
  headers.delete("x-powered-by");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
