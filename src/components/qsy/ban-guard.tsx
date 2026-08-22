import { useEffect, useState, type ReactNode } from "react";
import { BannedScreen } from "@/components/qsy/banned-screen";
import { deviceFingerprint, installTripwire } from "@/lib/tripwire";
import { checkBanStatus } from "@/lib/tripwire.functions";

/**
 * Instala las trampas anti-consola y bloquea toda la interfaz si el visitante
 * está baneado (por dispositivo o por cuenta).
 */
export function BanGuard({ children }: { children: ReactNode }) {
  const [banned, setBanned] = useState(false);

  useEffect(() => {
    installTripwire();
    // El estado de baneo lo decide siempre el servidor; limpiamos restos locales.
    try {
      localStorage.removeItem("qsy_banned");
      document.cookie = "qsy_banned=; path=/; max-age=0; samesite=lax";
    } catch {
      /* noop */
    }


    let userId: string | null = null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
          const parsed = JSON.parse(localStorage.getItem(key) ?? "{}") as {
            user?: { id?: string };
          };
          userId = parsed?.user?.id ?? null;
        }
      }
    } catch {
      /* noop */
    }

    const verify = () =>
      void checkBanStatus({ data: { fingerprint: deviceFingerprint(), userId } })
        .then((res) => {
          // El servidor manda: si dice baneado, se banea (aunque borren el flag local).
          setBanned(Boolean(res?.banned));
        })
        .catch(() => undefined);

    verify();
    const timer = window.setInterval(verify, 20000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  if (banned) return <BannedScreen />;
  return <>{children}</>;
}
