import { isDisposableEmail, DISPOSABLE_EMAIL_MESSAGE } from "@/lib/disposable-emails";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AtSign,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  LayoutPanelLeft,
  LogOut,
  Mail,
  Monitor,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/qsy-data";
import { profileHost } from "@/lib/domains";
import { useDashPref } from "@/lib/dash-prefs";
import { LANGS, useI18n } from "@/lib/i18n";
import { deleteMyAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsPage,
});

const COUNTRIES = [
  { code: "", name: "Ninguno" },
  { code: "ar", name: "Argentina" },
  { code: "br", name: "Brasil" },
  { code: "cl", name: "Chile" },
  { code: "co", name: "Colombia" },
  { code: "mx", name: "México" },
  { code: "pe", name: "Perú" },
  { code: "uy", name: "Uruguay" },
  { code: "py", name: "Paraguay" },
  { code: "bo", name: "Bolivia" },
  { code: "ve", name: "Venezuela" },
  { code: "ec", name: "Ecuador" },
  { code: "es", name: "España" },
  { code: "pt", name: "Portugal" },
  { code: "fr", name: "Francia" },
  { code: "it", name: "Italia" },
  { code: "de", name: "Alemania" },
  { code: "gb", name: "Reino Unido" },
  { code: "us", name: "Estados Unidos" },
  { code: "ca", name: "Canadá" },
  { code: "jp", name: "Japón" },
  { code: "kr", name: "Corea del Sur" },
  { code: "au", name: "Australia" },
];

function Card({
  icon: Icon,
  title,
  children,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
}) {
  return (
    <section
      className={`space-y-4 rounded-2xl border p-6 backdrop-blur-xl ${
        tone === "danger"
          ? "border-destructive/40 bg-destructive/5"
          : "border-border/60 bg-card/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`size-4 ${tone === "danger" ? "text-destructive" : "text-primary"}`} />
        <h2
          className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
            tone === "danger" ? "text-destructive" : "text-foreground"
          }`}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function PrefRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border/60 bg-background/50 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

function SettingsPage() {
  const { data: profile } = useMyProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang, setLang } = useI18n();

  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [savingInfo, setSavingInfo] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const [loginCode, setLoginCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [rotating, setRotating] = useState(false);

  const [slideSidebar, setSlideSidebar] = useDashPref("slide-sidebar");
  const [newsletter, setNewsletter] = useDashPref("newsletter");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("login_codes").select("code").maybeSingle();
      setLoginCode((data as { code?: string } | null)?.code ?? null);
    })();
  }, []);

  useEffect(() => {
    if (!profile) return;
    setUsername(profile.username);
    setDisplayName(profile.display_name ?? "");
    setCountry((profile.location ?? "").toLowerCase());
  }, [profile]);

  async function saveInfo() {
    if (!profile) return;
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    if (clean.length < 2) {
      toast.error("El nombre de usuario debe tener al menos 2 caracteres");
      return;
    }
    setSavingInfo(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: clean,
        display_name: displayName.trim() || clean,
        location: country,
        username_set: true,
      })
      .eq("id", profile.id);
    setSavingInfo(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate") ? "Ese nombre de usuario ya está en uso" : "No se pudo guardar",
      );
      return;
    }
    setUsername(clean);
    void queryClient.invalidateQueries();
    toast.success("Información actualizada");
  }

  async function changeEmail() {
    const next = window.prompt("Nuevo email de la cuenta:", email);
    if (!next || next === email) return;
    const { error } = await supabase.auth.updateUser({ email: next.trim() });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Te enviamos un correo de confirmación al nuevo email");
  }

  async function changePassword() {
    if (password.length < 6) {
      toast.error("Mínimo 6 caracteres");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    setShowPassword(false);
    toast.success("Contraseña actualizada");
  }

  async function rotateCode() {
    setRotating(true);
    const { data, error } = await supabase.rpc("rotate_login_code");
    setRotating(false);
    if (error) {
      toast.error("No se pudo generar el código", { description: error.message });
      return;
    }
    setLoginCode(data as unknown as string);
    setShowCode(true);
    toast.success("Nuevo código generado");
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  async function removeAccount() {
    if (!window.confirm("Esto elimina tu cuenta y todos tus perfiles para siempre. ¿Continuar?")) return;
    if (window.prompt('Escribí "ELIMINAR" para confirmar') !== "ELIMINAR") return;
    setDeleting(true);
    try {
      const res = await deleteMyAccount();
      if (!res.ok) {
        toast.error("No se pudo eliminar la cuenta", { description: res.error });
        return;
      }
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success("Cuenta eliminada");
      navigate({ to: "/", replace: true });
    } catch {
      toast.error("No se pudo eliminar la cuenta");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <Shield className="size-5 text-primary" /> Configuración de cuenta
        </h1>
        <Link
          to="/dashboard"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Resumen
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Columna izquierda */}
        <div className="space-y-6">
          <Card icon={UserRound} title="Información general">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Nombre de usuario</Label>
                <div className="relative">
                  <AtSign className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    className="pl-9"
                    value={username}
                    maxLength={24}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display">Nombre visible</Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="display"
                    className="pl-9"
                    value={displayName}
                    maxLength={40}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Alias secundario</Label>
                <Button asChild variant="secondary" className="w-full">
                  <Link to="/dashboard/profiles">+ Gestionar perfiles</Link>
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Dirección de email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    readOnly
                    className="pl-9 pr-10"
                    value={showEmail ? email : email.replace(/./g, "•")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmail((v) => !v)}
                    aria-label={showEmail ? "Ocultar email" : "Mostrar email"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showEmail ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="country">País / bandera</Label>
                <div className="relative">
                  <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border/60 bg-background/50 pl-9 pr-3 text-sm outline-none focus:border-primary"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code || "none"} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <Button onClick={saveInfo} disabled={savingInfo}>
              {savingInfo ? "Guardando…" : "Guardar cambios"}
            </Button>
          </Card>

          <Card icon={ShieldCheck} title="Seguridad de la cuenta">
            <PrefRow
              title="Autenticación multifactor (MFA)"
              description="Disponible próximamente — añadirá una capa adicional de seguridad a tu cuenta."
              checked={false}
              onChange={() => {}}
              disabled
            />
            <div className="rounded-xl border border-border/60 bg-background/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Contraseña de acceso</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Te recomendamos actualizarla periódicamente.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? "Cancelar" : "Modificar"}
                </Button>
              </div>
              {showPassword && (
                <div className="mt-4 flex flex-wrap items-end gap-2">
                  <div className="min-w-[200px] flex-1 space-y-2">
                    <Label htmlFor="pw">Nueva contraseña</Label>
                    <Input
                      id="pw"
                      type="password"
                      maxLength={72}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button onClick={changePassword}>Actualizar</Button>
                </div>
              )}
            </div>
          </Card>

          <Card icon={KeyRound} title="Código de acceso">
            <p className="text-xs text-muted-foreground">
              Podés iniciar sesión con este código en vez de tu contraseña. No lo compartas con nadie.
            </p>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={showCode ? (loginCode ?? "…") : "QSY-••••-••••-••••"}
                className="font-mono tracking-[0.14em]"
              />
              <Button type="button" variant="secondary" size="icon" onClick={() => setShowCode((v) => !v)}>
                {showCode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => {
                  if (!loginCode) return;
                  void navigator.clipboard.writeText(loginCode);
                  toast.success("Código copiado");
                }}
              >
                <Copy className="size-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={rotateCode} disabled={rotating}>
              <RefreshCw className={`size-4 ${rotating ? "animate-spin" : ""}`} />
              {rotating ? "Generando…" : "Generar código nuevo"}
            </Button>
          </Card>
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          <Card icon={Monitor} title="Preferencias del panel">
            <p className="text-xs text-muted-foreground">
              Ajusta cómo se ve y se comporta tu panel. Estas opciones se guardan en este dispositivo.
            </p>
            <PrefRow
              title="Barra lateral deslizable"
              description={
                slideSidebar
                  ? "Activada: la barra se abre con el botón de menú."
                  : "Desactivada: la barra queda fija y siempre visible (recomendado)."
              }
              checked={slideSidebar}
              onChange={setSlideSidebar}
            />
          </Card>

          <Card icon={LayoutPanelLeft} title="Conexiones de cuenta">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Google Account</p>
                <p className="text-xs text-muted-foreground">Próximamente</p>
              </div>
              <span className="rounded-lg border border-border/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pronto
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 p-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Discord</p>
                <p className="text-xs text-muted-foreground">
                  Mostrá tu presencia en vivo y tu servidor en el biolink.
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/dashboard/profile/customization">Conectar</Link>
              </Button>
            </div>
          </Card>

          <Card icon={Sparkles} title="Preferencias">
            <div className="space-y-2">
              <Label>Idioma del sistema</Label>
              <div className="grid grid-cols-3 gap-2">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`rounded-xl border px-3 py-3 text-center transition-colors ${
                      lang === l.code
                        ? "border-primary bg-primary/15 text-foreground"
                        : "border-border/60 bg-background/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{l.short}</span>
                    <span className="block text-[11px]">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <PrefRow
              title="Novedades y actualizaciones"
              description="Recibí lanzamientos y novedades de qsy.rip por correo."
              checked={newsletter}
              onChange={(v) => {
                setNewsletter(v);
                toast.success(v ? "Novedades activadas" : "Novedades desactivadas");
              }}
            />
          </Card>

          <Card icon={Trash2} title="Zona de peligro" tone="danger">
            <p className="text-xs text-muted-foreground">
              Tu link público:{" "}
              <span className="font-mono text-foreground">
                {profileHost(profile)}/{profile?.username ?? "…"}
              </span>
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={changeEmail}>
                Cambiar email
              </Button>
              <Button variant="secondary" asChild>
                <a href="https://discord.gg/qsy" target="_blank" rel="noreferrer">
                  Soporte Discord
                </a>
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={signOut}>
              <LogOut className="size-4" /> Cerrar sesión
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={removeAccount}
              disabled={deleting}
            >
              <Trash2 className="size-4" /> {deleting ? "Eliminando…" : "Eliminar cuenta"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
