import { useEffect, useState, type ReactNode } from "react";
import { BannedScreen } from "@/components/qsy/banned-screen";
import { deviceFingerprint, installTripwire, localBanFlag } from "@/lib/tripwire";
import { checkBanStatus } from "@/lib/tripwire.functions";

/**
 * Instala las trampas anti-consola y bloquea toda la interfaz si el visitante
 * está baneado (por dispositivo o por cuenta).
 */
export function BanGuard({ children }: { children: ReactNode }) {
  const [banned, setBanned] = useState(false);

  useEffect(() => {
    installTripwire();
    if (localBanFlag()) setBanned(true);

    const onBan = () => setBanned(true);
    window.addEventListener("qsy:banned", onBan);

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

    void checkBanStatus({ data: { fingerprint: deviceFingerprint(), userId } })
      .then((res) => {
        if (res?.banned) setBanned(true);
        else {
          try {
            localStorage.removeItem("qsy_banned");
          } catch {
            /* noop */
          }
        }
      })
      .catch(() => undefined);

    return () => window.removeEventListener("qsy:banned", onBan);
  }, []);

  if (banned) return <BannedScreen />;
  return <>{children}</>;
}
