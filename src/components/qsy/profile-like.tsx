import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  profileId: string;
  accent: string;
  initialLikes: number;
};

export function ProfileLikeButton({ profileId, accent, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setLikes(initialLikes), [initialLikes]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (!active) return;
      setUserId(uid);
      if (!uid) return;
      const { data: rows } = await supabase
        .from("profile_likes")
        .select("id")
        .eq("profile_id", profileId)
        .eq("user_id", uid)
        .limit(1);
      if (active) setLiked((rows?.length ?? 0) > 0);
    })();
    return () => {
      active = false;
    };
  }, [profileId]);

  const toggle = async () => {
    if (busy) return;
    if (!userId) {
      toast.error("Iniciá sesión para dar like");
      return;
    }
    setBusy(true);
    if (liked) {
      setLiked(false);
      setLikes((n) => Math.max(0, n - 1));
      const { error } = await supabase
        .from("profile_likes")
        .delete()
        .eq("profile_id", profileId)
        .eq("user_id", userId);
      if (error) {
        setLiked(true);
        setLikes((n) => n + 1);
        toast.error("No se pudo quitar el like");
      }
    } else {
      setLiked(true);
      setLikes((n) => n + 1);
      const { error } = await supabase
        .from("profile_likes")
        .insert({ profile_id: profileId, user_id: userId });
      if (error) {
        setLiked(false);
        setLikes((n) => Math.max(0, n - 1));
        if (!error.message.includes("duplicate")) toast.error("No se pudo dar like");
      }
    }
    setBusy(false);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="inline-flex items-center gap-1.5 transition hover:opacity-80 active:scale-95 disabled:opacity-60"
      aria-pressed={liked}
      aria-label={liked ? "Quitar like" : "Dar like"}
    >
      <Heart
        className="size-3 transition"
        style={{ color: accent, fill: liked ? accent : "transparent" }}
      />
      {likes.toLocaleString()} likes
    </button>
  );
}
