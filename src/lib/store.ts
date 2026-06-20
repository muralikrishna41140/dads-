import { useEffect, useState } from "react";

export type Expense = {
  id: string;
  amount: number;
  category: string;
  date: string; // ISO
  description: string;
  recurring?: "none" | "daily" | "weekly" | "monthly";
};

export type DocItem = {
  id: string;
  name: string;
  category: string;
  fileName?: string;
  dataUrl?: string; // base64 preview (small only)
  expiresOn?: string;
  uploadedAt: string;
};

export type Loan = {
  id: string;
  name: string;
  type: string;
  principal: number;
  rate: number; // annual %
  tenureMonths: number;
  startDate: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  category: "Personal" | "Financial" | "Family" | "Health";
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "Completed";
  pinned: boolean;
  dueDate?: string;
  createdAt: string;
};

type Schema = {
  expenses: Expense[];
  documents: DocItem[];
  loans: Loan[];
  notes: Note[];
};

const KEY = "daddesk:v1";

const seed: Schema = {
  expenses: [
    { id: "e1", amount: 1850, category: "Fuel", date: daysAgo(2), description: "Petrol fill-up", recurring: "none" },
    { id: "e2", amount: 4200, category: "Food", date: daysAgo(5), description: "Family groceries", recurring: "monthly" },
    { id: "e3", amount: 2300, category: "Medical", date: daysAgo(10), description: "Pharmacy", recurring: "none" },
    { id: "e4", amount: 12000, category: "Education", date: daysAgo(14), description: "Kid's school fees", recurring: "monthly" },
    { id: "e5", amount: 3400, category: "Utilities", date: daysAgo(20), description: "Electricity bill", recurring: "monthly" },
    { id: "e6", amount: 1500, category: "Fuel", date: daysAgo(25), description: "Petrol", recurring: "none" },
    { id: "e7", amount: 6500, category: "Shopping", date: daysAgo(8), description: "Clothing for family", recurring: "none" },
    { id: "e8", amount: 9800, category: "Travel", date: daysAgo(35), description: "Weekend trip", recurring: "none" },
  ],
  documents: [
    { id: "d1", name: "Aadhaar Card", category: "Aadhaar Card", uploadedAt: daysAgo(60) },
    { id: "d2", name: "PAN Card", category: "PAN Card", uploadedAt: daysAgo(90) },
    { id: "d3", name: "Car Insurance", category: "Insurance", uploadedAt: daysAgo(15), expiresOn: daysFromNow(12) },
    { id: "d4", name: "Driving License", category: "Driving License", uploadedAt: daysAgo(120), expiresOn: daysFromNow(58) },
    { id: "d5", name: "Vehicle RC", category: "Vehicle RC", uploadedAt: daysAgo(200) },
  ],
  loans: [
    { id: "l1", name: "Home Loan", type: "Home Loan", principal: 3500000, rate: 8.4, tenureMonths: 240, startDate: daysAgo(365 * 2) },
    { id: "l2", name: "Car Loan", type: "Vehicle Loan", principal: 800000, rate: 9.2, tenureMonths: 60, startDate: daysAgo(400) },
  ],
  notes: [
    { id: "n1", title: "Pay electricity bill", content: "Due before 25th", category: "Financial", priority: "High", status: "Pending", pinned: true, dueDate: daysFromNow(3), createdAt: daysAgo(2) },
    { id: "n2", title: "Doctor appointment for kid", content: "10:00 AM, City Clinic", category: "Health", priority: "Medium", status: "Pending", pinned: false, dueDate: daysFromNow(5), createdAt: daysAgo(1) },
    { id: "n3", title: "Family dinner plan", content: "Try the new restaurant", category: "Family", priority: "Low", status: "Pending", pinned: false, createdAt: daysAgo(4) },
  ],
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function read(): Schema {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Schema;
  } catch {
    return seed;
  }
}

function write(data: Schema) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event("daddesk:update"));
}

export function useStore() {
  const [data, setData] = useState<Schema>(() => read());

  useEffect(() => {
    const handler = () => setData(read());
    window.addEventListener("daddesk:update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("daddesk:update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = (mut: (d: Schema) => Schema) => {
    const next = mut(read());
    write(next);
    setData(next);
  };

  return {
    data,
    addExpense: (e: Omit<Expense, "id">) =>
      update((d) => ({ ...d, expenses: [{ ...e, id: crypto.randomUUID() }, ...d.expenses] })),
    deleteExpense: (id: string) =>
      update((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== id) })),
    addDocument: (doc: Omit<DocItem, "id" | "uploadedAt">) =>
      update((d) => ({ ...d, documents: [{ ...doc, id: crypto.randomUUID(), uploadedAt: new Date().toISOString() }, ...d.documents] })),
    deleteDocument: (id: string) =>
      update((d) => ({ ...d, documents: d.documents.filter((x) => x.id !== id) })),
    addLoan: (l: Omit<Loan, "id">) =>
      update((d) => ({ ...d, loans: [{ ...l, id: crypto.randomUUID() }, ...d.loans] })),
    deleteLoan: (id: string) =>
      update((d) => ({ ...d, loans: d.loans.filter((x) => x.id !== id) })),
    addNote: (n: Omit<Note, "id" | "createdAt">) =>
      update((d) => ({ ...d, notes: [{ ...n, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...d.notes] })),
    toggleNote: (id: string) =>
      update((d) => ({
        ...d,
        notes: d.notes.map((n) =>
          n.id === id ? { ...n, status: n.status === "Pending" ? "Completed" : "Pending" } : n,
        ),
      })),
    pinNote: (id: string) =>
      update((d) => ({ ...d, notes: d.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)) })),
    deleteNote: (id: string) =>
      update((d) => ({ ...d, notes: d.notes.filter((x) => x.id !== id) })),
  };
}

// Loan math
export function calcEmi(principal: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function loanProgress(loan: Loan) {
  const start = new Date(loan.startDate).getTime();
  const elapsedMonths = Math.max(
    0,
    Math.floor((Date.now() - start) / (1000 * 60 * 60 * 24 * 30.44)),
  );
  const paid = Math.min(elapsedMonths, loan.tenureMonths);
  return { paid, remaining: loan.tenureMonths - paid, pct: (paid / loan.tenureMonths) * 100 };
}

export const EXPENSE_CATEGORIES = [
  "Food",
  "Fuel",
  "Medical",
  "Education",
  "Shopping",
  "Utilities",
  "Travel",
  "Family",
] as const;

export const DOC_CATEGORIES = [
  "Aadhaar Card",
  "PAN Card",
  "Driving License",
  "Passport",
  "Insurance",
  "Vehicle RC",
  "Property Documents",
  "Bank Documents",
  "Education Certificates",
  "Medical Records",
] as const;

export const LOAN_TYPES = [
  "Home Loan",
  "Vehicle Loan",
  "Personal Loan",
  "Education Loan",
  "Gold Loan",
] as const;

export function inr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
