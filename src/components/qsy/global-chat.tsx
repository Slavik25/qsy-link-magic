import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flag, MessagesSquare, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import { timeAgo } from "@/lib/admin-data";
import { reportChatMessage, sendChatMessage } from "@/lib/moderation.functions";
import { deviceFingerprint } from "@/lib/tripwire";

type ChatRow = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  message: string;
  created_at: string;
};

export function GlobalChat() {
  const qc = useQueryClient();
  const { data: profile } = useMyProfile();
  const [text, setText] = useState("");
  const [me, setMe] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const { data: messages } = useQuery({
    queryKey: ["global-chat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("global_chat_messages")
        .select("id, user_id, author_name, author_avatar, message, created_at")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return ((data ?? []) as ChatRow[]).reverse();
    },
    refetchInterval: 8000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("qsy-global-chat")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_chat_messages" },
        () => void qc.invalidateQueries({ queryKey: ["global-chat"] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages?.length]);

  const send = useMutation({
    mutationFn: async (message: string) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Necesitas iniciar sesión");
      const { error } = await supabase.from("global_chat_messages").insert({
        user_id: auth.user.id,
        profile_id: profile?.id ?? null,
        author_name: profile?.username ?? "anon",
        author_avatar: profile?.avatar_url ?? null,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setText("");
      void qc.invalidateQueries({ queryKey: ["global-chat"] });
    },
    onError: (e: Error) => toast.error("No se pudo enviar", { description: e.message }),
  });

  async function remove(id: string) {
    const { error } = await supabase.from("global_chat_messages").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo borrar", { description: error.message });
      return;
    }
    void qc.invalidateQueries({ queryKey: ["global-chat"] });
  }

  return (
    <div className="pop-in flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <MessagesSquare className="size-4 text-primary" />
        <h2 className="text-base font-medium">Chat global</h2>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" /> en vivo
        </span>
      </div>

      <div className="mt-4 max-h-72 min-h-40 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages?.length ? (
          messages.map((m) => (
            <div key={m.id} className="group flex items-start gap-2.5">
              {m.author_avatar ? (
                <img src={m.author_avatar} alt="" className="size-7 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-strong font-mono text-[9px] text-primary">
                  {m.author_name.slice(0, 2).toUpperCase()}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">@{m.author_name}</span>
                  {timeAgo(m.created_at)}
                </p>
                <p className="break-words text-sm">{m.message}</p>
              </div>
              {me === m.user_id && (
                <button
                  onClick={() => remove(m.id)}
                  className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  title="Borrar"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-xs text-muted-foreground">
            Todavía no hay mensajes. ¡Sé el primero en escribir!
          </p>
        )}
        <div ref={bottom} />
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const value = text.trim();
          if (!value) return;
          send.mutate(value.slice(0, 300));
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
          placeholder="Escribe algo para toda la comunidad…"
          className="h-10 rounded-xl text-sm"
        />
        <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl" disabled={send.isPending}>
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
