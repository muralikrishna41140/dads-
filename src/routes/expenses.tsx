import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Plus, Trash2, Download, Calculator, X } from "lucide-react";
import { useStore, inr, EXPENSE_CATEGORIES } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — DadDesk AI" }] }),
  component: Expenses,
});

const COLORS = ["#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#A855F7", "#EF4444", "#14B8A6", "#F97316"];

function Expenses() {
  const { data, addExpense, deleteExpense } = useStore();
  const [filter, setFilter] = useState<"week" | "month" | "year" | "all">("month");
  const [category, setCategory] = useState<string>("all");
  const [calcOpen, setCalcOpen] = useState(false);

  const filtered = useMemo(() => {
    const now = new Date();
    return data.expenses.filter((e) => {
      const d = new Date(e.date);
      if (filter === "week") {
        const wk = new Date(); wk.setDate(now.getDate() - 7);
        if (d < wk) return false;
      } else if (filter === "month") {
        if (d < new Date(now.getFullYear(), now.getMonth(), 1)) return false;
      } else if (filter === "year") {
        if (d < new Date(now.getFullYear(), 0, 1)) return false;
      }
      if (category !== "all" && e.category !== category) return false;
      return true;
    });
  }, [data.expenses, filter, category]);

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const monthTotal = data.expenses
    .filter((e) => new Date(e.date) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
    .reduce((s, e) => s + e.amount, 0);
  const yearTotal = data.expenses
    .filter((e) => new Date(e.date).getFullYear() === new Date().getFullYear())
    .reduce((s, e) => s + e.amount, 0);
  const avgDaily = monthTotal / new Date().getDate();

  const byCategory = useMemo(() => {
    const m = new Map<string, number>();
    filtered.forEach((e) => m.set(e.category, (m.get(e.category) ?? 0) + e.amount));
    return [...m.entries()].map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // monthly trend (last 6 months)
  const monthly = useMemo(() => {
    return [...Array(6)].map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i), 1);
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const total = data.expenses
        .filter((e) => new Date(e.date) >= d && new Date(e.date) < next)
        .reduce((s, e) => s + e.amount, 0);
      return { month: d.toLocaleDateString("en-IN", { month: "short" }), amount: total };
    });
  }, [data.expenses]);

  const exportCsv = () => {
    const rows = [["Date", "Category", "Amount", "Description"], ...filtered.map((e) => [
      new Date(e.date).toLocaleDateString(),
      e.category,
      String(e.amount),
      e.description.replace(/,/g, " "),
    ])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "expenses.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported expenses.csv");
  };

  return (
    <AppShell title="Expense Tracker" subtitle="Track every rupee with clarity">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total (filtered)" value={inr(total)} />
        <StatCard label="This Month" value={inr(monthTotal)} />
        <StatCard label="This Year" value={inr(yearTotal)} />
        <StatCard label="Avg Daily (Month)" value={inr(Math.round(avgDaily))} />
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {(["week", "month", "year", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors ${filter === f ? "bg-gradient-brand text-white shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f === "all" ? "All time" : f}
            </button>
          ))}
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setCalcOpen(true)}>
            <Calculator className="mr-1.5 h-4 w-4" /> Calculator
          </Button>
          <Button variant="outline" className="rounded-full" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export
          </Button>
          <AddExpense onAdd={(e) => { addExpense(e); toast.success("Expense added"); }} />
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-bold">By Category</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
            {byCategory.map((c, i) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <h3 className="font-display text-lg font-bold">6-Month Trend</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: number) => inr(v)} contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="amount" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#2563EB" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="mt-6 rounded-3xl border border-border bg-card shadow-soft">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-display text-lg font-bold">Transactions</h3>
          <span className="text-xs text-muted-foreground">{filtered.length} items</span>
        </div>
        <ul className="divide-y divide-border">
          {filtered.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-muted-foreground">No expenses match your filter.</li>
          )}
          {filtered.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-accent/40"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-brand-soft text-primary font-semibold">
                {e.category[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{e.description || e.category}</div>
                <div className="text-xs text-muted-foreground">
                  {e.category} · {new Date(e.date).toLocaleDateString()}
                  {e.recurring && e.recurring !== "none" && <span className="ml-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-warning">{e.recurring}</span>}
                </div>
              </div>
              <div className="text-right font-display font-bold">{inr(e.amount)}</div>
              <button onClick={() => { deleteExpense(e.id); toast("Deleted"); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.li>
          ))}
        </ul>
      </div>

      <CalculatorDialog open={calcOpen} onOpenChange={setCalcOpen} />
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function AddExpense({ onAdd }: { onAdd: (e: Parameters<ReturnType<typeof useStore>["addExpense"]>[0]) => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [cat, setCat] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [desc, setDesc] = useState("");
  const [recurring, setRecurring] = useState<"none" | "daily" | "weekly" | "monthly">("none");

  const submit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return toast.error("Enter a valid amount");
    onAdd({ amount: n, category: cat, date: new Date(date).toISOString(), description: desc, recurring });
    setAmount(""); setDesc(""); setRecurring("none");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-gradient-brand shadow-elegant"><Plus className="mr-1 h-4 w-4" /> Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
        <div className="grid gap-3 pt-2">
          <div><Label>Amount (₹)</Label><Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={cat} onValueChange={setCat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>
          <div><Label>Description</Label><Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Optional note" /></div>
          <div>
            <Label>Recurring</Label>
            <Select value={recurring} onValueChange={(v) => setRecurring(v as typeof recurring)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={submit} className="mt-2 w-full bg-gradient-brand">Save Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CalculatorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const [val, setVal] = useState("0");
  const press = (k: string) => {
    if (k === "C") return setVal("0");
    if (k === "=") {
      try {
        // eslint-disable-next-line no-new-func
        const r = Function(`return (${val.replace(/×/g, "*").replace(/÷/g, "/")})`)();
        setVal(String(r));
      } catch { setVal("Error"); }
      return;
    }
    setVal((v) => (v === "0" || v === "Error" ? k : v + k));
  };
  const keys = ["7","8","9","÷","4","5","6","×","1","2","3","-","0",".","C","+"];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader><DialogTitle>Calculator</DialogTitle></DialogHeader>
        <div className="rounded-2xl bg-secondary p-4 text-right font-display text-2xl text-white">{val}</div>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {keys.map((k) => (
            <button key={k} onClick={() => press(k)} className="rounded-xl border border-border bg-card py-3 font-medium hover:bg-accent">{k}</button>
          ))}
          <button onClick={() => press("=")} className="col-span-4 rounded-xl bg-gradient-brand py-3 font-semibold text-white">=</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
