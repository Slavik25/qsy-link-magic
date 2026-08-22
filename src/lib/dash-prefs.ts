import { useCallback, useEffect, useState } from "react";

const EVENT = "qsy-dash-prefs";

export type DashPrefKey = "slide-sidebar" | "newsletter";

const DEFAULTS: Record<DashPrefKey, boolean> = {
  "slide-sidebar": false,
  newsletter: true,
};

function read(key: DashPrefKey): boolean {
  if (typeof window === "undefined") return DEFAULTS[key];
  const raw = window.localStorage.getItem(`qsy-pref-${key}`);
  if (raw === null) return DEFAULTS[key];
  return raw === "1";
}

/** Preferencia booleana local del panel, sincronizada entre componentes. */
export function useDashPref(key: DashPrefKey) {
  const [value, setValue] = useState<boolean>(DEFAULTS[key]);

  useEffect(() => {
    setValue(read(key));
    const sync = () => setValue(read(key));
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [key]);

  const update = useCallback(
    (next: boolean) => {
      window.localStorage.setItem(`qsy-pref-${key}`, next ? "1" : "0");
      setValue(next);
      window.dispatchEvent(new Event(EVENT));
    },
    [key],
  );

  return [value, update] as const;
}
