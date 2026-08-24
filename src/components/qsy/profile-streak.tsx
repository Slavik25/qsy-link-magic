import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/** Widget gratuito de racha para el biolink público. */
export function ProfileStreak({ userId, accent }: { userId: string; accent: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("user_streaks")
        .select("current_days, last_claim_date")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled || !data) return;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const last = data.last_claim_date as string | null;
      const alive = !!last && last >= yesterday;
      setDays(alive ? (data.current_days ?? 0) : 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (days === null) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`Racha de ${days} días seguidos en QSY`}
    >
      <Flame className="size-3" style={{ color: accent }} />
      {days} días de racha
    </span>
  );
}
