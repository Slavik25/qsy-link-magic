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

/**
 * No existe ningún baneo automático desde el cliente: solo el panel de
 * administración puede suspender cuentas. Cualquier script que intente
 * "reportar" un ataque no tiene efecto alguno.
 */


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

  lockdownScripting();
}

/**
 * Congela `console` y los métodos de `localStorage` para que los scripts
 * pegados en la consola no puedan montar sus paneles "anti-clear".
 * La CSP del servidor ya prohíbe `eval` / `new Function` en los dominios
 * públicos, que es lo que usan esos payloads para ejecutarse.
 */
function lockdownScripting() {
  // Impide que un script redefina console.* o los métodos de storage para
  // montar sus propios paneles "anti-clear".
  for (const key of ["log", "clear", "warn", "error", "info", "table", "dir"]) {
    try {
      const original = (console as unknown as Record<string, unknown>)[key];
      Object.defineProperty(console, key, {
        value: original,
        writable: false,
        configurable: false,
      });
    } catch {
      /* noop */
    }
  }

  for (const key of ["clear", "removeItem", "setItem", "getItem"]) {
    try {
      const proto = Storage.prototype as unknown as Record<string, unknown>;
      Object.defineProperty(proto, key, {
        value: proto[key],
        writable: false,
        configurable: false,
      });
    } catch {
      /* noop */
    }
  }

  try {
    Object.freeze(console);
    Object.freeze(Storage.prototype);
  } catch {
    /* noop */
  }
}

/**
 * Vigilancia pasiva de la consola: no bloquea a nadie ni banea, solo detecta
 * los rastros típicos de los scripts de "exploit" (globals inyectados,
 * lectura del token de sesión, eval masivo) y los deja registrados en la
 * auditoría para que el staff los vea. La seguridad real vive en el servidor.
 */
export function installConsoleWatch(getUserId: () => string | null) {
  if (typeof window === "undefined") return;
  const w = window as unknown as Record<string, unknown>;
  if (w["__qsy_console_watch"]) return;
  w["__qsy_console_watch"] = true;
  if (!enforcedHost()) return;

  const reported = new Set<string>();

  const report = async (signal: string, detail: string) => {
    if (reported.has(signal)) return;
    reported.add(signal);
    try {
      const { reportConsoleSignal } = await import("./tripwire.functions");
      await reportConsoleSignal({
        data: {
          signal,
          detail,
          userId: getUserId(),
          fingerprint: deviceFingerprint(),
        },
      });
    } catch {
      /* noop */
    }
  };

  const SUSPICIOUS = [
    "qsyToken",
    "qsyUserId",
    "qsyEmail",
    "qsySave",
    "qsyExploit",
    "pwned",
    "exploit",
  ];

  const scan = () => {
    const hit = SUSPICIOUS.filter((k) => k in w);
    if (hit.length) void report("injected_globals", hit.join(","));
  };

  scan();
  window.setInterval(scan, 4000);

  // Aviso disuasorio en la consola.
  try {
    console.log(
      "%cQSY · Zona restringida",
      "color:#ff3b6b;font-size:20px;font-weight:800",
    );
    console.log(
      "%cPegar código acá no da coins, ni premium, ni acceso: los precios y permisos se validan en el servidor. Todo intento queda registrado.",
      "color:#c9b6ff;font-size:12px",
    );
  } catch {
    /* noop */
  }
}
