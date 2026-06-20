import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2, Calculator } from "lucide-react";
import { useStore, inr, calcEmi, loanProgress, LOAN_TYPES } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/loans")({
  head: () => ({ meta: [{ title: "Bank & Loans — DadDesk AI" }] }),
  component: Loans,
});

function Loans() {
  const { data, addLoan, deleteLoan } = useStore();
  const [selected, setSelected] = useState<string | null>(data.loans[0]?.id ?? null);
  const [filter, setFilter] = useState<"upcoming" | "overdue" | "smallest" | "largest">("upcoming");
  const [calcOpen, setCalcOpen] = useState(false);

  const active = data.loans.find((l) => l.id === selected) ?? data.loans[0];

  const totalEmi = data.loans.reduce((s, l) => s + calcEmi(l.principal, l.rate, l.tenureMonths), 0);
  const totalPrincipal = data.loans.reduce((s, l) => s + l.principal, 0);

  const schedule = useMemo(() => {
    if (!active) return [];
    const emi = calcEmi(active.principal, active.rate, active.tenureMonths);
    const start = new Date(active.startDate);
    const now = new Date();
    const rows = [];
    for (let i = 1; i <= active.tenureMonths; i++) {
      const due = new Date(start);
      due.setMonth(start.getMonth() + i);
      const status = due < now ? "Paid" : i === Math.ceil((+now - +start) / (1000 * 60 * 60 * 24 * 30.44)) + 1 ? "Due" : "Upcoming";
      rows.push({ n: i, due, amount: emi, status });
    }
    if (filter === "upcoming") return rows.filter((r) => r.status !== "Paid").slice(0, 12);
    if (filter === "overdue") return rows.filter((r) => r.status === "Due");
    if (filter === "smallest") return [...rows].sort((a, b) => a.amount - b.amount).slice(0, 12);
    return [...rows].sort((a, b) => b.amount - a.amount).slice(0, 12);
  }, [active, filter]);

  return (
    <AppShell title="Bank & Loans" subtitle="EMIs, schedules, and full visibility">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">Active Loans</div>
          <div className="mt-1 font-display text-2xl font-bold">{data.loans.length}</div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">Total Principal</div>
          <div className="mt-1 font-display text-2xl font-bold">{inr(totalPrincipal)}</div>
        </div>
        <div className="rounded-3xl bg-gradient-brand p-5 text-white shadow-glow">
          <div className="text-xs text-white/85">Monthly EMI</div>
          <div className="mt-1 font-display text-2xl font-bold">{inr(Math.round(totalEmi))}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">Your loans</h3>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setCalcOpen(true)}>
            <Calculator className="mr-1.5 h-4 w-4" /> Interest Calculator
          </Button>
          <AddLoan onAdd={(l) => { addLoan(l); toast.success("Loan added"); }} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {data.loans.map((l) => {
          const emi = calcEmi(l.principal, l.rate, l.tenureMonths);
          const totalInterest = emi * l.tenureMonths - l.principal;
          const prog = loanProgress(l);
          const isActive = active?.id === l.id;
          return (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`group relative overflow-hidden rounded-3xl border bg-card p-6 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant ${isActive ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">{l.type}</div>
                  <div className="font-display text-xl font-bold">{l.name}</div>
                </div>
                <CircularProgress pct={prog.pct} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Principal</div>
                  <div className="font-semibold">{inr(l.principal)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">EMI</div>
                  <div className="font-semibold">{inr(Math.round(emi))}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Interest</div>
                  <div className="font-semibold">{inr(Math.round(totalInterest))}</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {prog.paid}/{l.tenureMonths} months paid · {prog.remaining} remaining
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); deleteLoan(l.id); toast("Loan removed"); }}
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-display text-lg font-bold">Schedule · {active.name}</h3>
            <div className="inline-flex rounded-full border border-border bg-background p-1 text-xs">
              {(["upcoming", "overdue", "smallest", "largest"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 capitalize transition-colors ${filter === f ? "bg-gradient-brand text-white" : "text-muted-foreground"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Due Date</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((r) => (
                  <tr key={r.n} className="border-b border-border/50 last:border-0">
                    <td className="px-3 py-2.5 font-medium">{r.n}</td>
                    <td className="px-3 py-2.5">{r.due.toLocaleDateString()}</td>
                    <td className="px-3 py-2.5 text-right font-semibold">{inr(Math.round(r.amount))}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.status === "Paid" ? "bg-success/15 text-success" :
                        r.status === "Due" ? "bg-destructive/15 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InterestCalc open={calcOpen} onOpenChange={setCalcOpen} />
    </AppShell>
  );
}

function CircularProgress({ pct }: { pct: number }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(100, pct) / 100) * c;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} stroke="currentColor" strokeWidth="6" fill="none" className="text-muted" />
        <circle cx="32" cy="32" r={r} stroke="url(#g)" strokeWidth="6" fill="none" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" />
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-xs font-bold">{Math.round(pct)}%</div>
    </div>
  );
}

function AddLoan({ onAdd }: { onAdd: (l: Parameters<ReturnType<typeof useStore>["addLoan"]>[0]) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>(LOAN_TYPES[0]);
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [tenure, setTenure] = useState("");
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));

  const submit = () => {
    const p = parseFloat(principal), r = parseFloat(rate), t = parseFloat(tenure);
    if (!name.trim() || !p || !r || !t) return toast.error("Fill all fields");
    onAdd({ name: name.trim(), type, principal: p, rate: r, tenureMonths: t, startDate: new Date(start).toISOString() });
    setOpen(false); setName(""); setPrincipal(""); setRate(""); setTenure("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-gradient-brand shadow-elegant"><Plus className="mr-1 h-4 w-4" /> Add Loan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Loan</DialogTitle></DialogHeader>
        <div className="grid gap-3 pt-2">
          <div><Label>Loan name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home Loan" /></div>
          <div>
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LOAN_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Principal (₹)</Label><Input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} /></div>
            <div><Label>Interest %</Label><Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} /></div>
            <div><Label>Tenure (months)</Label><Input type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} /></div>
            <div><Label>Start date</Label><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
          </div>
          <Button onClick={submit} className="mt-2 w-full bg-gradient-brand">Save Loan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InterestCalc({ open, onOpenChange }: { open: boolean; onOpenChange: (b: boolean) => void }) {
  const [p, setP] = useState("1000000");
  const [r, setR] = useState("9");
  const [t, setT] = useState("120");
  const emi = calcEmi(+p || 0, +r || 0, +t || 1);
  const interest = emi * (+t || 1) - (+p || 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>EMI & Interest Calculator</DialogTitle></DialogHeader>
        <div className="grid gap-3 pt-2">
          <div><Label>Principal (₹)</Label><Input type="number" value={p} onChange={(e) => setP(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Interest %</Label><Input type="number" value={r} onChange={(e) => setR(e.target.value)} /></div>
            <div><Label>Tenure (months)</Label><Input type="number" value={t} onChange={(e) => setT(e.target.value)} /></div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-brand-soft p-4">
              <div className="text-xs text-muted-foreground">Monthly EMI</div>
              <div className="font-display text-xl font-bold text-primary">{inr(Math.round(emi))}</div>
            </div>
            <div className="rounded-2xl bg-warning/10 p-4">
              <div className="text-xs text-muted-foreground">Total Interest</div>
              <div className="font-display text-xl font-bold text-warning">{inr(Math.round(interest))}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
