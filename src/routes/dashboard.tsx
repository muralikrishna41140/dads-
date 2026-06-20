import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Wallet,
  Landmark,
  FolderLock,
  ClipboardList,
  PlusCircle,
  Upload,
  Sparkles,
  Bell,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useStore, inr, calcEmi } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — DadDesk AI" },
      { name: "description", content: "Your family finance command center." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data } = useStore();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthExpenses = data.expenses.filter((e) => new Date(e.date) >= monthStart);
  const monthTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);

  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthEnd = monthStart;
  const prevTotal = data.expenses
    .filter((e) => new Date(e.date) >= prevMonthStart && new Date(e.date) < prevMonthEnd)
    .reduce((s, e) => s + e.amount, 0);
  const trend = prevTotal ? ((monthTotal - prevTotal) / prevTotal) * 100 : 0;

  const totalLoanEmi = data.loans.reduce((s, l) => s + calcEmi(l.principal, l.rate, l.tenureMonths), 0);
  const pendingTasks = data.notes.filter((n) => n.status === "Pending").length;

  const summary = [
    { label: "Total Expenses (Month)", value: inr(monthTotal), icon: Wallet, trend, color: "from-blue-500 to-sky-400" },
    { label: "Active Loans", value: String(data.loans.length), icon: Landmark, sub: `EMI ~ ${inr(totalLoanEmi)}/mo`, color: "from-violet-500 to-fuchsia-400" },
    { label: "Documents Stored", value: String(data.documents.length), icon: FolderLock, sub: `${new Set(data.documents.map(d => d.category)).size} categories`, color: "from-emerald-500 to-teal-400" },
    { label: "Pending Tasks", value: String(pendingTasks), icon: ClipboardList, sub: "in Smart Notes", color: "from-amber-500 to-orange-400" },
  ];

  // Weekly bar chart
  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const total = data.expenses
      .filter((e) => new Date(e.date).toDateString() === d.toDateString())
      .reduce((s, e) => s + e.amount, 0);
    return { day: label, amount: total };
  });

  // Quick actions
  const actions = [
    { label: "Add Expense", to: "/expenses", icon: PlusCircle },
    { label: "Upload Document", to: "/documents", icon: Upload },
    { label: "Add Loan", to: "/loans", icon: Landmark },
    { label: "Create Note", to: "/notes", icon: ClipboardList },
  ] as const;

  // Reminders
  const reminders = [
    ...data.documents
      .filter((d) => d.expiresOn)
      .map((d) => {
        const days = Math.ceil((new Date(d.expiresOn!).getTime() - Date.now()) / 86400000);
        return { title: `${d.name} expires`, sub: `${days} days left`, urgent: days < 30 };
      }),
    ...data.notes
      .filter((n) => n.dueDate && n.status === "Pending")
      .slice(0, 3)
      .map((n) => ({ title: n.title, sub: `Due ${new Date(n.dueDate!).toLocaleDateString()}`, urgent: n.priority === "High" })),
  ].slice(0, 5);

  // AI Insights
  const fuelMonth = monthExpenses.filter((e) => e.category === "Fuel").reduce((s, e) => s + e.amount, 0);
  const fuelPrev = data.expenses
    .filter((e) => e.category === "Fuel" && new Date(e.date) >= prevMonthStart && new Date(e.date) < prevMonthEnd)
    .reduce((s, e) => s + e.amount, 0);
  const fuelDelta = fuelPrev ? Math.round(((fuelMonth - fuelPrev) / fuelPrev) * 100) : 0;

  const insights = [
    fuelDelta !== 0
      ? `Fuel expenses ${fuelDelta > 0 ? "increased" : "decreased"} by ${Math.abs(fuelDelta)}% vs last month.`
      : "Fuel spending is steady — well managed!",
    monthTotal > prevTotal
      ? `Overall spending is up ${Math.round(trend)}% this month. Review top categories.`
      : "You're spending less than last month. Great discipline! 💪",
    "Tip: Set aside 20% of income for savings before spending.",
  ];

  return (
    <AppShell title="Welcome back, Dad 👋" subtitle="Here's your family at a glance">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.color} opacity-10 blur-2xl`} />
              <div className="flex items-center justify-between">
                <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.color} text-white shadow-soft`}>
                  <Icon className="h-5 w-5" />
                </div>
                {"trend" in s && s.trend !== undefined && s.trend !== 0 && (
                  <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${s.trend > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                    {s.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(Math.round(s.trend))}%
                  </div>
                )}
              </div>
              <div className="mt-4 text-xs font-medium text-muted-foreground">{s.label}</div>
              <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
              {s.sub && <div className="mt-1 text-xs text-muted-foreground">{s.sub}</div>}
            </motion.div>
          );
        })}
      </div>

      {/* Main row */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Last 7 days</h3>
              <p className="text-sm text-muted-foreground">Daily spending overview</p>
            </div>
            <Link to="/expenses" className="text-sm font-medium text-primary hover:underline">View all →</Link>
          </div>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(37,99,235,0.06)" }}
                  formatter={(v: number) => inr(v)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                />
                <Bar dataKey="amount" fill="url(#grad)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-brand p-6 text-white shadow-glow">
          <div className="flex items-center gap-2 text-sm font-medium text-white/90">
            <Sparkles className="h-4 w-4" /> AI Insights
          </div>
          <ul className="mt-5 space-y-4">
            {insights.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/80" />
                <span className="text-white/95">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Quick actions + reminders */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h3 className="font-display text-lg font-bold">Quick actions</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Link
                  key={a.label}
                  to={a.to}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent hover:shadow-soft"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{a.label}</span>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <Bell className="h-5 w-5 text-primary" /> Upcoming
          </div>
          <ul className="mt-4 space-y-3">
            {reminders.length === 0 && <li className="text-sm text-muted-foreground">All clear! 🎉</li>}
            {reminders.map((r, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${r.urgent ? "bg-destructive" : "bg-warning"}`} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.sub}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
