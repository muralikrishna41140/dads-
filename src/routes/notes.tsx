import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Plus, Pin, Trash2, Check, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/notes")({
  head: () => ({ meta: [{ title: "Smart Notes — DadDesk AI" }] }),
  component: Notes,
});

const CATS = ["Personal", "Financial", "Family", "Health"] as const;
const PRIO = ["High", "Medium", "Low"] as const;

const PRIO_STYLE: Record<string, string> = {
  High: "bg-destructive/15 text-destructive",
  Medium: "bg-warning/15 text-warning",
  Low: "bg-success/15 text-success",
};

function Notes() {
  const { data, addNote, toggleNote, pinNote, deleteNote } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "Pending" | "Completed">("all");

  const filtered = data.notes
    .filter((n) => (cat === "all" ? true : n.category === cat))
    .filter((n) => (status === "all" ? true : n.status === status))
    .filter((n) => [n.title, n.content].join(" ").toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  const pending = data.notes.filter((n) => n.status === "Pending").length;
  const done = data.notes.length - pending;

  return (
    <AppShell title="Smart Notes" subtitle="Tasks, reminders and family checklists">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="mt-1 font-display text-2xl font-bold">{data.notes.length}</div>
        </div>
        <div className="rounded-3xl border border-warning/30 bg-warning/10 p-5 shadow-soft">
          <div className="text-xs font-medium text-warning">Pending</div>
          <div className="mt-1 font-display text-2xl font-bold text-warning">{pending}</div>
        </div>
        <div className="rounded-3xl border border-success/30 bg-success/10 p-5 shadow-soft">
          <div className="text-xs font-medium text-success">Completed</div>
          <div className="mt-1 font-display text-2xl font-bold text-success">{done}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes…" className="pl-9 rounded-full" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="w-36 rounded-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="inline-flex rounded-full border border-border bg-card p-1 text-xs">
          {(["all", "Pending", "Completed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 capitalize transition-colors ${status === s ? "bg-gradient-brand text-white" : "text-muted-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <AddNote onAdd={(n) => { addNote(n); toast.success("Note added"); }} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-border bg-card py-12 text-center text-sm text-muted-foreground">
            No notes match your filters. Add your first reminder!
          </div>
        )}
        {filtered.map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`group relative overflow-hidden rounded-3xl border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elegant ${
              n.status === "Completed" ? "opacity-70" : ""
            } ${n.pinned ? "border-primary/40 ring-1 ring-primary/15" : "border-border"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIO_STYLE[n.priority]}`}>{n.priority}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{n.category}</span>
                </div>
                <h3 className={`mt-2 font-display text-base font-bold ${n.status === "Completed" ? "line-through" : ""}`}>{n.title}</h3>
                {n.content && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.content}</p>}
                {n.dueDate && (
                  <div className="mt-2 text-xs text-primary">
                    Due {new Date(n.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <button onClick={() => pinNote(n.id)} className={`shrink-0 rounded-lg p-1.5 ${n.pinned ? "text-primary" : "text-muted-foreground"} hover:bg-accent`}>
                <Pin className={`h-4 w-4 ${n.pinned ? "fill-primary" : ""}`} />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button size="sm" variant={n.status === "Completed" ? "outline" : "default"} className={`rounded-full text-xs ${n.status === "Pending" ? "bg-gradient-brand" : ""}`} onClick={() => toggleNote(n.id)}>
                <Check className="mr-1 h-3.5 w-3.5" /> {n.status === "Completed" ? "Reopen" : "Mark done"}
              </Button>
              <button onClick={() => { deleteNote(n.id); toast("Deleted"); }} className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}

function AddNote({ onAdd }: { onAdd: (n: Parameters<ReturnType<typeof useStore>["addNote"]>[0]) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cat, setCat] = useState<typeof CATS[number]>("Personal");
  const [prio, setPrio] = useState<typeof PRIO[number]>("Medium");
  const [due, setDue] = useState("");

  const submit = () => {
    if (!title.trim()) return toast.error("Add a title");
    onAdd({
      title: title.trim(),
      content,
      category: cat,
      priority: prio,
      status: "Pending",
      pinned: false,
      dueDate: due ? new Date(due).toISOString() : undefined,
    });
    setOpen(false); setTitle(""); setContent(""); setDue("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-gradient-brand shadow-elegant"><Plus className="mr-1 h-4 w-4" /> Add Note</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Note / Task</DialogTitle></DialogHeader>
        <div className="grid gap-3 pt-2">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Pay electricity bill" /></div>
          <div><Label>Details</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Optional notes…" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={cat} onValueChange={(v) => setCat(v as typeof CATS[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={prio} onValueChange={(v) => setPrio(v as typeof PRIO[number])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIO.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Due date (optional)</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
          <Button onClick={submit} className="mt-2 w-full bg-gradient-brand">Save Note</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
