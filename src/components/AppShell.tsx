import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  FolderLock,
  Landmark,
  StickyNote,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", labelKey: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", labelKey: "Expenses", icon: Wallet },
  { to: "/documents", labelKey: "Documents", icon: FolderLock },
  { to: "/loans", labelKey: "Bank & Loans", icon: Landmark },
  { to: "/notes", labelKey: "Smart Notes", icon: StickyNote },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:flex lg:translate-x-0",
          open ? "flex translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 px-6 pt-6 pb-8">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-brand shadow-glow">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-tight">{t("app.brand")}</div>
            <div className="text-xs text-sidebar-foreground/60">{t("app.tagline")}</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = pathname.startsWith(item.to);
            const Icon = item.icon;
            const label =
              item.labelKey === "Dashboard"
                ? t("app.navDashboard")
                : item.labelKey === "Expenses"
                  ? t("app.navExpenses")
                  : item.labelKey === "Documents"
                    ? t("app.navDocuments")
                    : item.labelKey === "Bank & Loans"
                      ? t("app.navLoans")
                      : t("app.navNotes");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-primary/15 text-white shadow-soft"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-white",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-gradient-brand"
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="m-4 rounded-2xl bg-gradient-brand p-4 text-white shadow-glow">
          <div className="text-sm font-semibold">{t("app.fatherDay")}</div>
          <p className="mt-1 text-xs text-white/85">{t("app.support")}</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="lg:pl-72">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card lg:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{title}</h1>
              {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            <LanguageSwitcher className="hidden sm:block" />
            <Link
              to="/"
              className="hidden rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:inline-flex"
            >
              ← {t("app.home")}
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
