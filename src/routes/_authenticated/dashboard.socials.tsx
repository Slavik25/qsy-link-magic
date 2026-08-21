import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, useSocials } from "@/lib/qsy-data";
import { SOCIAL_PLATFORMS, iconFor, labelFor } from "@/lib/qsy";

export const Route = createFileRoute("/_authenticated/dashboard/socials")({
  component: SocialsEditor,
});

const urlSchema = z.string().trim().url("URL inválida").max(500);

function SocialsEditor() {
  const { data: profile } = useMyProfile();
  const { data: socials = [] } = useSocials(profile?.id);
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["socials", profile?.id] });

  async function save(platform: string) {
    const existing = socials.find((s) => s.platform === platform);
    const raw = drafts[platform] ?? existing?.url ?? "";
    if (!raw.trim()) {
      if (existing) {
        await supabase.from("socials").delete().eq("id", existing.id);
        void refresh();
      }
      return;
    }
    const parsed = urlSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(`${labelFor(platform)}: ${parsed.error.issues[0]!.message}`);
      return;
    }
    const { error } = existing
      ? await supabase.from("socials").update({ url: parsed.data }).eq("id", existing.id)
      : await supabase.from("socials").insert({
          profile_id: profile!.id,
          platform,
          url: parsed.data,
          position: socials.length,
        });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${labelFor(platform)} guardado`);
    void refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Socials</h1>
      <p className="text-sm text-muted-foreground">
        Deja el campo vacío y guarda para eliminar una red.
      </p>

      <div className="space-y-3">
        {SOCIAL_PLATFORMS.map((platform) => {
          const Icon = iconFor(platform);
          const existing = socials.find((s) => s.platform === platform);
          return (
            <div key={platform} className="flex items-center gap-3 rounded-2xl glass p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-strong">
                <Icon className="size-4" />
              </span>
              <span className="w-24 shrink-0 text-sm">{labelFor(platform)}</span>
              <Input
                className="min-w-0 flex-1"
                maxLength={500}
                placeholder="https://"
                defaultValue={existing?.url ?? ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [platform]: e.target.value }))}
              />
              <Button size="sm" variant="secondary" onClick={() => save(platform)} disabled={!profile}>
                Guardar
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
