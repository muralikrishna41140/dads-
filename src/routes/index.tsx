import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Wallet,
  FolderLock,
  Landmark,
  StickyNote,
  Sparkles,
  Heart,
  ShieldCheck,
  TrendingUp,
  Quote,
} from "lucide-react";
import heroImg from "@/assets/hero-father.jpg";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DadDesk AI — Built for Fathers ❤️" },
      {
        name: "description",
        content:
          "Because Dad deserves more than just a thank you. Manage expenses, documents, loans and daily tasks in one intelligent platform built for fathers.",
      },
      { property: "og:title", content: "DadDesk AI — Built for Fathers" },
      { property: "og:description", content: "AI-powered personal finance & document assistant for dads." },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Wallet,
    title: "Expense Tracker",
    desc: "Track every rupee across 8 family categories with AI insights and beautiful charts.",
    to: "/expenses",
  },
  {
    icon: FolderLock,
    title: "Documents Vault",
    desc: "Aadhaar, PAN, Insurance — securely organized with expiry reminders.",
    to: "/documents",
  },
  {
    icon: Landmark,
    title: "Bank & Loans",
    desc: "Auto-calculated EMIs, loan progress, and never-miss-it payment alerts.",
    to: "/loans",
  },
  {
    icon: StickyNote,
    title: "Smart Notes",
    desc: "Tasks, reminders, and family checklists — pinned, prioritized, complete.",
    to: "/notes",
  },
] as const;

const stats = [
  { label: "Expenses Managed", value: "₹2.4Cr+", icon: TrendingUp },
  { label: "Documents Stored", value: "180K", icon: FolderLock },
  { label: "Loans Tracked", value: "12K+", icon: Landmark },
  { label: "Tasks Completed", value: "1.2M", icon: ShieldCheck },
];

const testimonials = [
  {
    name: "Rohit Sharma",
    role: "Father of two",
    quote:
      "Finally I don't lose track of insurance renewals. DadDesk reminded me 15 days before my car policy expired.",
  },
  {
    name: "Anil Verma",
    role: "Family CFO",
    quote:
      "The AI insights nudged me when fuel spends crept up by 18%. Saved me ₹4,200 last month.",
  },
  {
    name: "Suresh K.",
    role: "Dad of a teenager",
    quote:
      "All my EMIs, school fees and documents in one beautiful place. It feels built for me.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-glow">
              <Heart className="h-4.5 w-4.5 fill-white text-white" />
            </div>
            <span className="font-display text-lg font-bold">DadDesk AI</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#stats" className="hover:text-foreground">Why us</a>
            <a href="#voices" className="hover:text-foreground">Voices</a>
          </nav>
          <Link to="/dashboard">
            <Button className="rounded-full bg-gradient-brand shadow-elegant">
              Open Dashboard <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <FloatingIcons />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Father's Day 2026 · AI Edition
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Because Dad Deserves More Than Just a{" "}
              <span className="text-gradient-brand">Thank You</span> <span className="inline-block">❤️</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Manage expenses, documents, loans and daily tasks in one intelligent platform built for fathers.
              Quiet, powerful, and always one step ahead.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard">
                <Button size="lg" className="rounded-full bg-gradient-brand px-6 shadow-elegant">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  Explore Features
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-success" /> Bank-grade security</div>
              <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> AI-powered insights</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/40 shadow-glow">
              <img
                src={heroImg}
                alt="Father carrying child on his shoulders at sunset"
                width={1024}
                height={1024}
                className="h-full w-full object-cover"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -left-4 bottom-6 hidden w-56 rounded-2xl border border-border bg-card p-4 shadow-elegant sm:block"
            >
              <div className="text-xs text-muted-foreground">This month's saving</div>
              <div className="mt-1 font-display text-xl font-bold text-success">+ ₹8,420</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/4 bg-gradient-brand" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="absolute -right-2 top-6 hidden w-48 rounded-2xl border border-border bg-card p-4 shadow-elegant sm:block"
            >
              <div className="flex items-center gap-2 text-xs text-warning">
                <Sparkles className="h-3.5 w-3.5" /> AI Insight
              </div>
              <div className="mt-1 text-sm font-medium leading-snug">
                Insurance renews in 12 days — set a reminder?
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Modules</div>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Everything Dad needs, in one place</h2>
          <p className="mt-3 text-muted-foreground">
            Four powerful workspaces, designed with the calm and precision a father deserves.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  to={f.to}
                  className="group relative block h-full overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-glow"
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20" />
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand-soft text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-primary">
                    Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <Icon className="h-6 w-6 text-primary" />
                  <div className="mt-4 font-display text-3xl font-bold">{s.value}</div>
                  <div className="mt-1 text-sm text-white/65">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="voices" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold uppercase tracking-widest text-primary">Voices of Dads</div>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Loved by fathers everywhere</h2>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-soft"
            >
              <Quote className="h-6 w-6 text-primary/40" />
              <p className="mt-3 text-sm leading-relaxed text-foreground">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand font-display text-sm font-semibold text-white">
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-brand p-10 text-white shadow-glow sm:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Give Dad the gift of calm.</h2>
            <p className="mt-3 text-white/85">
              Set up his financial life in under 5 minutes. No clutter. Just clarity.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="mt-6 rounded-full bg-white px-6 text-primary hover:bg-white/90">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 fill-primary text-primary" /> Made with love for every father.
          </div>
          <div className="text-xs text-muted-foreground">© 2026 DadDesk AI · Father's Day Hackathon Edition</div>
        </div>
      </footer>
    </div>
  );
}

function FloatingIcons() {
  const icons = [Wallet, FolderLock, Landmark, StickyNote, Sparkles, ShieldCheck];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {icons.map((Icon, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/15"
          style={{
            left: `${(i * 17 + 5) % 90}%`,
            top: `${(i * 23 + 10) % 80}%`,
          }}
          animate={{ y: [0, -18, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        >
          <Icon className="h-10 w-10" />
        </motion.div>
      ))}
    </div>
  );
}
