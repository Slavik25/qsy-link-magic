/**
 * Trampas anti-consola del lado del cliente.
 *
 * Detecta intentos de manipular la app desde la consola del navegador
 * (acceso a globales trampa, llamadas a la API desde `eval`/consola,
 * intentos de tocar la sesión guardada) y dispara un baneo total del sitio.
 */

import { reportConsoleAttack } from "./tripwire.functions";

const FP_KEY = "qsy_fp";
const BAN_KEY = "qsy_banned";

function hash(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i++) {
    h1 = (h1 ^ input.charCodeAt(i)) >>> 0;
    h1 = (h1 * 16777619) >>> 0;
    h2 = (h2 + input.charCodeAt(i) * (i + 7)) >>> 0;
  }
  return `${h1.toString(36)}${h2.toString(36)}`;
}

/**
 * Huella derivada del propio navegador (no de un valor guardado), así borrar
 * el localStorage desde la consola no genera una identidad nueva.
 */
export function deviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    const n = navigator as Navigator & { deviceMemory?: number };
    const parts = [
      navigator.userAgent,
      navigator.language,
      (navigator.languages ?? []).join(","),
      String(navigator.hardwareConcurrency ?? ""),
      String(n.deviceMemory ?? ""),
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      String(new Date().getTimezoneOffset()),
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
      String(navigator.maxTouchPoints ?? ""),
      navigator.platform ?? "",
    ];
    const fp = `qsy_${hash(parts.join("|"))}`;
    try {
      localStorage.setItem(FP_KEY, fp);
    } catch {
      /* noop */
    }
    return fp;
  } catch {
    return "no-storage";
  }
}

export function localBanFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(BAN_KEY) === "1";
  } catch {
    return false;
  }
}

function markBanned() {
  try {
    localStorage.setItem(BAN_KEY, "1");
    document.cookie = `qsy_banned=1; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* noop */
  }
}

let fired = false;

/** Dispara el baneo total: registra la evidencia y bloquea la interfaz. */
export function triggerBan(kind: string, detail: string) {
  if (fired) return;
  fired = true;
  markBanned();
  const userId = readUserId();
  void reportConsoleAttack({
    data: { fingerprint: deviceFingerprint(), kind, detail, userId },
  }).catch(() => undefined);
  window.dispatchEvent(new CustomEvent("qsy:banned"));
}

function readUserId(): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { user?: { id?: string } };
      if (parsed?.user?.id) return parsed.user.id;
    }
  } catch {
    /* noop */
  }
  return null;
}

/** Señales de que una llamada viene de la consola / eval y no del bundle. */
function fromConsole(stack: string | undefined): boolean {
  if (!stack) return false;
  const lines = stack.split("\n").slice(1, 6).join("\n");
  return /eval at |at eval|<anonymous>:\d+:\d+|debugger eval code|VM\d+/.test(lines);
}

let installed = false;

export function installTripwire() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  // 1) Globales trampa: nadie legítimo los toca; solo aparecen en tutoriales
  //    de "hackeo" y en la consola.
  const honeypots: Record<string, unknown> = {
    __QSY_ADMIN__: { grantAdmin: () => true },
    qsyAdmin: { setRank: () => true },
    __QSY_TOKEN__: "qsy_live_sk_000000000000",
    supabaseAdmin: {},
    grantPremium: () => true,
  };
  for (const [name, value] of Object.entries(honeypots)) {
    try {
      Object.defineProperty(window, name, {
        configurable: false,
        enumerable: false,
        get() {
          triggerBan("console_honeypot", `Acceso a window.${name}`);
          return value;
        },
        set() {
          triggerBan("console_honeypot", `Escritura en window.${name}`);
        },
      });
    } catch {
      /* noop */
    }
  }

  // 2) Llamadas a la API disparadas desde la consola (fetch / XHR sin stack de app).
  const nativeFetch = window.fetch.bind(window);
  window.fetch = function patchedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const sensitive = /\/_serverFn\/|supabase\.co\/(rest|auth|functions|storage)/i.test(url ?? "");
    if (sensitive && fromConsole(new Error().stack)) {
      triggerBan("console_api_call", `fetch manual a ${String(url).slice(0, 200)}`);
      return Promise.reject(new Error("nope"));
    }
    return nativeFetch(input as RequestInfo, init);
  } as typeof window.fetch;

  const nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function patchedOpen(
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    const href = typeof url === "string" ? url : url.href;
    if (/\/_serverFn\/|supabase\.co\//i.test(href) && fromConsole(new Error().stack)) {
      triggerBan("console_api_call", `XHR manual a ${href.slice(0, 200)}`);
      throw new Error("nope");
    }
    return (nativeOpen as unknown as (...args: unknown[]) => void).apply(this, [
      method,
      url,
      ...rest,
    ]);
  } as typeof XMLHttpRequest.prototype.open;

  // 3) Manipulación directa del token de sesión guardado.
  try {
    const nativeSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function patchedSet(this: Storage, key: string, value: string) {
      const isAuthKey = key.startsWith("sb-") && key.endsWith("-auth-token");
      if (isAuthKey && fromConsole(new Error().stack)) {
        triggerBan("session_tampering", `Escritura manual en ${key}`);
        return;
      }
      return nativeSet.call(this, key, value);
    };
  } catch {
    /* noop */
  }
}
