import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { useStore, inr, calcEmi } from "@/lib/store";
import { Button } from "@/components/ui/button";

type Msg = { role: "user" | "ai"; text: string };

function answerQuery(q: string, data: ReturnType<typeof useStore>["data"]): string {
  const lower = q.toLowerCase();
  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);

  if (/spend|spent|expense/.test(lower) && /month/.test(lower)) {
    const total = data.expenses
      .filter((e) => new Date(e.date) >= monthAgo)
      .reduce((s, e) => s + e.amount, 0);
    return `You've spent ${inr(total)} so far this month across ${data.expenses.filter((e) => new Date(e.date) >= monthAgo).length} transactions.`;
  }
  if (/highest|top/.test(lower) && /(category|expense)/.test(lower)) {
    const m = new Map<string, number>();
    data.expenses.forEach((e) => m.set(e.category, (m.get(e.category) ?? 0) + e.amount));
    const top = [...m.entries()].sort((a, b) => b[1] - a[1])[0];
    return top ? `Your highest expense category is ${top[0]} at ${inr(top[1])}.` : "No expense data yet.";
  }
  if (/save|saving/.test(lower)) {
    return "Tip: Review recurring expenses, cap discretionary categories like Shopping and Travel by 15%, and set automatic SIPs on payday. Even ₹5,000/month invested at 12% becomes ₹11.5L in 10 years.";
  }
  if (/fuel/.test(lower)) {
    const fuel = data.expenses.filter((e) => e.category === "Fuel").reduce((s, e) => s + e.amount, 0);
    return `You've spent ${inr(fuel)} on fuel in total across ${data.expenses.filter((e) => e.category === "Fuel").length} fill-ups.`;
  }
  if (/insurance|expire/.test(lower)) {
    const ins = data.documents.find((d) => /insurance/i.test(d.category) && d.expiresOn);
    if (ins?.expiresOn) {
      const days = Math.ceil((new Date(ins.expiresOn).getTime() - Date.now()) / 86400000);
      return `Your ${ins.name} expires in ${days} day${days === 1 ? "" : "s"} (${new Date(ins.expiresOn).toLocaleDateString()}). Consider renewing soon.`;
    }
    return "No insurance document with expiry tracked yet.";
  }
  if (/emi|loan/.test(lower)) {
    if (!data.loans.length) return "You haven't added any loans yet.";
    const lines = data.loans.map((l) => `${l.name}: EMI ≈ ${inr(calcEmi(l.principal, l.rate, l.tenureMonths))}/month`);
    return `Here are your loans:\n• ${lines.join("\n• ")}`;
  }
  if (/document|file/.test(lower)) {
    return `You have ${data.documents.length} documents in your vault across ${new Set(data.documents.map((d) => d.category)).size} categories.`;
  }
  if (/reminder|task|pending/.test(lower)) {
    const pending = data.notes.filter((n) => n.status === "Pending");
    return `You have ${pending.length} pending task${pending.length === 1 ? "" : "s"}. ${pending[0] ? `Next up: "${pending[0].title}".` : ""}`;
  }
  return "I can help with expenses, documents, loans, and reminders. Try: \"How much did I spend this month?\", \"When does my insurance expire?\", or \"What's my pending EMI?\"";
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hi Dad 👋 I'm your DadDesk AI. Ask me about expenses, loans, documents or reminders." },
  ]);
  const { data } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const reply = answerQuery(text, data);
    setMsgs((m) => [...m, { role: "user", text }, { role: "ai", text: reply }]);
    setInput("");
  };

  const suggestions = [
    "How much did I spend this month?",
    "Which category is highest?",
    "When does my insurance expire?",
    "What's my pending EMI?",
  ];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-brand text-white shadow-glow"
        aria-label="Open AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-glow"
          >
            <div className="flex items-center gap-3 bg-gradient-brand px-5 py-4 text-white">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display font-semibold">DadDesk AI</div>
                <div className="text-xs text-white/80">Always here for you</div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={
                      m.role === "user"
                        ? "max-w-[80%] whitespace-pre-line rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                        : "max-w-[85%] whitespace-pre-line rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2 text-sm text-foreground"
                    }
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {msgs.length <= 2 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setMsgs((m) => [...m, { role: "user", text: s }, { role: "ai", text: answerQuery(s, data) }]);
                    }}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-border bg-background/60 p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything…"
                className="flex-1 rounded-full border border-border bg-card px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="icon" onClick={send} className="rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
