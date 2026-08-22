/**
 * Utilidades de sesión del cliente.
 *
 * Ya no se banea de forma automática por abrir la consola ni por llamadas
 * manuales: solo se limpia la consola y se ocultan los atajos de DevTools.
 * Los baneos se aplican únicamente desde el panel de administración.
 */

const FP_KEY = "qsy_fp";

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


let installed = false;

/** Solo se aplica fuera del entorno de edición/desarrollo. */
function enforcedHost(): boolean {
  const h = location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")) return false;
  if (h.includes("lovable.app") || h.includes("lovable.dev")) return false;
  return true;
}

/** Limpia la consola periódicamente y desactiva los atajos de DevTools. */
export function installTripwire() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  if (!enforcedHost()) return;

  const kill = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  window.addEventListener("contextmenu", kill, true);

  window.addEventListener(
    "keydown",
    (e) => {
      const k = e.key.toLowerCase();
      const devtools =
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c", "k"].includes(k)) ||
        (e.metaKey && e.altKey && ["i", "j", "c"].includes(k)) ||
        ((e.ctrlKey || e.metaKey) && k === "u");
      if (devtools) kill(e);
    },
    true,
  );

  const clear = () => {
    try {
      console.clear();
    } catch {
      /* noop */
    }
  };
  clear();
  window.setInterval(clear, 2000);
}
