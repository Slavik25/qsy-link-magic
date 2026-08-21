import { useRef, useState } from "react";
import { Loader2, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const isVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);

const TEN_YEARS = 60 * 60 * 24 * 3650;

type Props = {
  label: string;
  hint: string;
  accept: string;
  value: string;
  maxMb?: number;
  preview?: "image" | "audio" | "video" | "none";
  onChange: (url: string) => void;
};

export function AssetUploader({
  label,
  hint,
  accept,
  value,
  maxMb = 8,
  preview = "image",
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`El archivo supera los ${maxMb}MB`);
      return;
    }
    setBusy(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Sesión no encontrada");

      const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
      const path = `${uid}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("user-assets")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;

      const { data: signed, error: signErr } = await supabase.storage
        .from("user-assets")
        .createSignedUrl(path, TEN_YEARS);
      if (signErr || !signed) throw signErr ?? new Error("No se pudo generar el enlace");

      onChange(signed.signedUrl);
      toast.success(`${label} subido`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al subir el archivo");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-background/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Quitar ${label}`}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        )}
      </div>

      {value && preview === "image" && !isVideoUrl(value) && (
        <img
          src={value}
          alt={`Vista previa de ${label}`}
          className="mt-3 h-28 w-full rounded-xl object-cover"
        />
      )}
      {value && (preview === "video" || (preview === "image" && isVideoUrl(value))) && (
        <video
          key={value}
          src={value}
          autoPlay
          loop
          muted
          playsInline
          controls
          aria-label={`Vista previa de ${label}`}
          className="mt-3 h-28 w-full rounded-xl bg-black object-cover"
        />
      )}
      {value && preview === "audio" && (
        <audio src={value} controls className="mt-3 w-full">
          <track kind="captions" />
        </audio>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-3 w-full rounded-xl"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
        {value ? "Reemplazar archivo" : "Subir archivo"}
      </Button>
    </div>
  );
}
