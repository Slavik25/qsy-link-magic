import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Props = { profileId: string; accent: string };

type WallPost = {
  id: string;
  author_id: string | null;
  author_name: string;
  author_avatar: string | null;
  message: string;
  created_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "ahora";
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

export function ProfileWall({ profileId, accent }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const qc = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["wall-me"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .eq("user_id", auth.user.id)
        .maybeSingle();
      return { userId: auth.user.id, profile };
    },
  });

  const signedIn = !!me?.userId;

  const { data: posts = [] } = useQuery({
    queryKey: ["wall", profileId, signedIn],
    queryFn: async () => {
      // La identidad del autor solo es visible para usuarios autenticados.
      const columns = signedIn
        ? "id, author_id, author_name, author_avatar, message, created_at"
        : "id, author_name, author_avatar, message, created_at";
      const { data, error } = await supabase
        .from("wall_posts")
        .select(columns)
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return ((data ?? []) as unknown as WallPost[]).map((p) => ({ ...p, author_id: p.author_id ?? null }));
    },
  });

  const post = useMutation({
    mutationFn: async () => {
      if (!me?.userId) throw new Error("Inicia sesión para escribir en el mural");
      const text = message.trim();
      if (!text) throw new Error("Escribe un mensaje");
      const { error } = await supabase.from("wall_posts").insert({
        profile_id: profileId,
        author_id: me.userId,
        author_profile_id: me.profile?.id ?? null,
        author_name: me.profile?.username ?? "anon",
        author_avatar: me.profile?.avatar_url ?? null,
        message: text.slice(0, 280),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      toast.success("Mensaje publicado en el mural");
      void qc.invalidateQueries({ queryKey: ["wall", profileId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("wall_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mensaje eliminado");
      void qc.invalidateQueries({ queryKey: ["wall", profileId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium lift"
        style={{ borderColor: `color-mix(in oklab, ${accent} 35%, transparent)` }}
      >
        <MessageSquare className="size-3.5" style={{ color: accent }} />
        Wall
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px]">{posts.length}</span>
      </button>

      {open && (
        <aside
          className="fixed right-4 top-16 z-50 flex max-h-[75vh] w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border border-border bg-background/85 backdrop-blur-xl pop-in"
          style={{ boxShadow: `0 30px 80px -30px color-mix(in oklab, ${accent} 60%, transparent)` }}
        >
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Mural</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar mural">
              <X className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {posts.length === 0 && (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Todavía no hay mensajes. Sé el primero.
              </p>
            )}
            {posts.map((p) => (
              <article key={p.id} className="group flex gap-2.5 rounded-xl border border-border/60 bg-white/[0.03] p-3">
                {p.author_avatar ? (
                  <img src={p.author_avatar} alt={p.author_name} className="size-8 shrink-0 rounded-full object-cover" loading="lazy" />
                ) : (
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-[10px] font-bold">
                    {p.author_name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-xs">
                    <span className="font-medium" style={{ color: accent }}>@{p.author_name}</span>
                    <span className="text-muted-foreground">{timeAgo(p.created_at)}</span>
                  </p>
                  <p className="mt-0.5 break-words text-sm text-foreground/85">{p.message}</p>
                </div>
                {me?.userId === p.author_id && (
                  <button
                    type="button"
                    aria-label="Eliminar mensaje"
                    onClick={() => remove.mutate(p.id)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                  </button>
                )}
              </article>
            ))}
          </div>

          <footer className="border-t border-border p-3">
            {me?.userId ? (
              <div className="flex items-center gap-2">
                <input
                  value={message}
                  maxLength={280}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") post.mutate();
                  }}
                  placeholder="Deja un mensaje…"
                  className="h-9 flex-1 rounded-lg border border-border bg-white/[0.04] px-3 text-sm outline-none focus:border-primary"
                />
                <Button size="icon" className="size-9" onClick={() => post.mutate()} disabled={post.isPending}>
                  <Send className="size-4" />
                </Button>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Inicia sesión en QSY para escribir en el mural.
              </p>
            )}
          </footer>
        </aside>
      )}
    </>
  );
}
