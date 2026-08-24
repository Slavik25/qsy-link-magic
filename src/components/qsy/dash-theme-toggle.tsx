import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "qsy-dash-theme";
export type DashTheme = "light" | "dark";

export function readDashTheme(): DashTheme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(KEY) === "dark" ? "dark" : "light";
}

export function useDashTheme() {
  const [theme, setThemeState] = useState<DashTheme>("light");

  // Lee la preferencia guardada tras hidratar (evita mismatch de SSR).
  useEffect(() => {
    setThemeState(readDashTheme());
  }, []);

  // Solo se persiste ante una acción explícita del usuario, nunca al montar.
  const setTheme = useCallback((next: DashTheme) => {
    setThemeState(next);
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, next);
    window.dispatchEvent(new CustomEvent("qsy-dash-theme", { detail: next }));
  }, []);

  useEffect(() => {
    function onChange(e: Event) {
      const next = (e as CustomEvent<DashTheme>).detail;
      if (next === "light" || next === "dark") setThemeState(next);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) setThemeState(e.newValue);
    }
    window.addEventListener("qsy-dash-theme", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("qsy-dash-theme", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);



  return { theme, setTheme } as const;
}


export function DashThemeToggle() {
  const { theme, setTheme } = useDashTheme();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={dark ? "Tema claro" : "Tema oscuro"}
      className="grid size-9 place-items-center rounded-full border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
