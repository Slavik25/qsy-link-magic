import { profileHost } from "@/lib/domains";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { QsyLogo } from "./logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { LANGS, useI18n } from "@/lib/i18n";

const items = [
  { label: "Explore", to: "/explore" as const },
  { label: "Templates", to: "/templates" as const },
];


function Flag({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className="h-3.5 w-5 rounded-[3px] object-cover ring-1 ring-border/70"
    />
  );
}

type Profile = {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  rank?: string | null;
  domain?: string | null;
};

function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("qsy-light")
      ? false
      : localStorage.getItem("qsy-theme") !== "light";
    setDark(isDark);
    apply(isDark);
  }, []);
  function apply(isDark: boolean) {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.classList.toggle("qsy-dark", isDark);
    root.classList.toggle("qsy-light", !isDark);
  }
  function toggle() {
    setDark((prev) => {
      const next = !prev;
      apply(next);
      localStorage.setItem("qsy-theme", next ? "dark" : "light");
      return next;
    });
  }
  return { dark, toggle };
}

function useLangSelector() {
  const { lang, setLang } = useI18n();
  return { lang, change: setLang };
}

export function SiteNav() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { dark, toggle } = useTheme();
  const { lang, change } = useLangSelector();

  const activeId = useActiveProfileId();

  useEffect(() => {
    let cancelled = false;
    async function load(userId: string | undefined) {
      if (!userId) {
        if (!cancelled) setProfile(null);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, rank, domain")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
      const list = (data ?? []) as (Profile & { id: string })[];
      const chosen = list.find((p) => p.id === activeId) ?? list[0] ?? null;
      if (!cancelled) setProfile(chosen);
    }
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSignedIn(!!data.session);
      void load(data.session?.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session);
      void load(session?.user.id);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [activeId]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const activeLang = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const initials = (profile?.display_name || profile?.username || "qsy").slice(0, 2).toUpperCase();

  const themeButton = (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar apariencia"
      className="grid size-9 place-items-center rounded-xl border border-border/70 bg-secondary/40 text-primary transition-colors hover:bg-secondary"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );

  const langMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-secondary/40 px-3 text-xs font-semibold transition-colors hover:bg-secondary"
        >
          <Flag src={activeLang.flag} alt={activeLang.label} />
          {activeLang.short}
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {LANGS.map((l) => (
          <DropdownMenuItem key={l.code} onClick={() => change(l.code)} className="gap-2 text-xs">
            <Flag src={l.flag} alt={l.label} />
            {l.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background/70 px-3 shadow-[0_20px_60px_-30px_oklch(0_0_0/0.9)] backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-8">
          <QsyLogo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                className="transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {i.label}
              </Link>
            ))}
            <a href="/#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="/#pricing" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {themeButton}
          {langMenu}
          {signedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-secondary/40 pl-1 pr-2.5 text-xs font-semibold transition-colors hover:bg-secondary"
                >
                  <Avatar className="size-7">
                    <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 truncate">{profile?.username ?? "cuenta"}</span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  {profileHost(profile)}/{profile?.username ?? ""}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="gap-2 text-xs">
                  <Link to="/dashboard">
                    <LayoutDashboard className="size-3.5" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                {profile?.username && (
                  <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link to="/$username" params={{ username: profile.username }}>
                      <User className="size-3.5" /> Ver mi perfil
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="gap-2 text-xs text-destructive">
                  <LogOut className="size-3.5" /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Create your QSY</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {themeButton}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-xl border border-border/70 bg-secondary/40"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-border/70 bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-3 text-sm">
            {items.map((i) => (
              <Link key={i.to} to={i.to} onClick={() => setOpen(false)}>
                {i.label}
              </Link>
            ))}
            <a href="/#features" onClick={() => setOpen(false)}>
              Features
            </a>
            <a href="/#pricing" onClick={() => setOpen(false)}>
              Pricing
            </a>
            <div className="flex gap-2 pt-1">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => change(l.code)}
                  className={`flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs ${
                    l.code === lang ? "border-primary/60 text-foreground" : "border-border/70 text-muted-foreground"
                  }`}
                >
                  <Flag src={l.flag} alt={l.label} />
                  {l.short}
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {signedIn ? (
                <>
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="secondary" size="sm" onClick={signOut}>
                    Salir
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="secondary" size="sm" className="flex-1">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/register">Create</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
