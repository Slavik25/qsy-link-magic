import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { QsyLogo } from "./logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const items = [
  { label: "Explore", to: "/explore" as const },
  { label: "Templates", to: "/templates" as const },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
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
          {signedIn ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
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

        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-lg glass md:hidden"
        >
          <Menu className="size-4" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background/95 px-4 py-4 md:hidden">
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
            <div className="mt-2 flex gap-2">
              <Button asChild variant="secondary" size="sm" className="flex-1">
                <Link to={signedIn ? "/dashboard" : "/login"}>
                  {signedIn ? "Dashboard" : "Login"}
                </Link>
              </Button>
              {!signedIn && (
                <Button asChild size="sm" className="flex-1">
                  <Link to="/register">Create</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
