import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Upload,
  Trash2,
  Eye,
  Share2,
  Search,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Plus,
} from "lucide-react";
import { useStore, DOC_CATEGORIES } from "@/lib/store";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/documents")({
  head: () => ({ meta: [{ title: "Documents — DadDesk AI" }] }),
  component: Documents,
});

function Documents() {
  const { data, addDocument, deleteDocument } = useStore();
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<typeof data.documents[number] | null>(null);

  const filtered = data.documents.filter((d) =>
    [d.name, d.category, d.fileName ?? ""].join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  const recent = [...data.documents].sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt)).slice(0, 4);
  const expiring = data.documents.filter((d) => {
    if (!d.expiresOn) return false;
    const days = (new Date(d.expiresOn).getTime() - Date.now()) / 86400000;
    return days < 90;
  });

  const share = (name: string) => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/documents?id=${encodeURIComponent(name)}`;
    const msg = `Sharing my ${name} via DadDesk AI: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <AppShell title="Documents Vault" subtitle="Every important document, secure and ready">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="text-xs font-medium text-muted-foreground">Total Documents</div>
          <div className="mt-1 font-display text-2xl font-bold">{data.documents.length}</div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div className="text-xs font-medium text-muted-foreground">Categories</div>
          <div className="mt-1 font-display text-2xl font-bold">{new Set(data.documents.map(d => d.category)).size}</div>
        </div>
        <div className="rounded-3xl border border-warning/30 bg-warning/10 p-5 shadow-soft">
          <div className="flex items-center gap-1.5 text-xs font-medium text-warning"><AlertTriangle className="h-3.5 w-3.5" /> Expiring soon</div>
          <div className="mt-1 font-display text-2xl font-bold text-warning">{expiring.length}</div>
        </div>
      </div>

      {expiring.length > 0 && (
        <div className="mt-6 rounded-3xl border border-warning/30 bg-warning/5 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning"><ShieldAlert className="h-4 w-4" /> Expiry alerts</div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {expiring.map((d) => {
              const days = Math.ceil((new Date(d.expiresOn!).getTime() - Date.now()) / 86400000);
              return (
                <li key={d.id} className="rounded-xl border border-warning/30 bg-card p-3 text-sm">
                  <span className="font-medium">{d.name}</span> expires in{" "}
                  <span className="font-semibold text-warning">{days} days</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Recent */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold">Recent uploads</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-gradient-brand-soft p-4">
              <FileText className="h-6 w-6 text-primary" />
              <div className="mt-3 truncate text-sm font-semibold">{d.name}</div>
              <div className="text-xs text-muted-foreground">{new Date(d.uploadedAt).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="pl-9 rounded-full" />
        </div>
        <UploadDocument onAdd={(d) => { addDocument(d); toast.success("Document added"); }} />
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-brand opacity-0 blur-2xl transition-opacity group-hover:opacity-15" />
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white shadow-soft">
              <FileText className="h-6 w-6" />
            </div>
            <div className="mt-4 truncate font-display text-base font-bold">{d.name}</div>
            <div className="text-xs text-muted-foreground">{d.category}</div>
            {d.expiresOn && (
              <div className="mt-2 inline-flex rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning">
                Expires {new Date(d.expiresOn).toLocaleDateString()}
              </div>
            )}
            <div className="mt-4 flex items-center gap-1">
              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => setPreview(d)}>
                <Eye className="mr-1 h-3.5 w-3.5" /> View
              </Button>
              <Button size="sm" variant="outline" className="rounded-full text-xs" onClick={() => share(d.name)}>
                <Share2 className="mr-1 h-3.5 w-3.5" /> Share
              </Button>
              <button onClick={() => { deleteDocument(d.id); toast("Deleted"); }} className="ml-auto rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Preview */}
      <Dialog open={!!preview} onOpenChange={(b) => !b && setPreview(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{preview?.name}</DialogTitle></DialogHeader>
          <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-muted/40 py-16 text-sm text-muted-foreground">
            {preview?.dataUrl ? (
              preview.dataUrl.startsWith("data:image") ? (
                <img src={preview.dataUrl} alt={preview.name} className="max-h-96 rounded-xl object-contain" />
              ) : (
                <a href={preview.dataUrl} download={preview.fileName} className="text-primary underline">Download file</a>
              )
            ) : (
              <>📄 Preview not available · Securely stored</>
            )}
          </div>
          {preview && (
            <div className="text-xs text-muted-foreground">
              Category: {preview.category} · Uploaded {new Date(preview.uploadedAt).toLocaleDateString()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function UploadDocument({ onAdd }: { onAdd: (d: Parameters<ReturnType<typeof useStore>["addDocument"]>[0]) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cat, setCat] = useState<string>(DOC_CATEGORIES[0]);
  const [expires, setExpires] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);

  const submit = async () => {
    if (!name.trim()) return toast.error("Enter a document name");
    let dataUrl: string | undefined;
    if (file && file.size < 2_000_000) {
      dataUrl = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(file);
      });
    }
    onAdd({
      name: name.trim(),
      category: cat,
      fileName: file?.name,
      dataUrl,
      expiresOn: expires ? new Date(expires).toISOString() : undefined,
    });
    setOpen(false); setName(""); setExpires(""); setFile(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full bg-gradient-brand shadow-elegant"><Plus className="mr-1 h-4 w-4" /> Upload</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
        <div className="grid gap-3 pt-2">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Car Insurance" /></div>
          <div>
            <Label>Category</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Expiry date (optional)</Label><Input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} /></div>
          <div>
            <Label>File</Label>
            <label
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
              className={`mt-1 grid cursor-pointer place-items-center rounded-2xl border-2 border-dashed py-8 text-sm transition-colors ${drag ? "border-primary bg-primary/5" : "border-border bg-muted/40"}`}
            >
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="mt-2 text-muted-foreground">{file ? file.name : "Drag & drop or click to upload"}</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <Button onClick={submit} className="mt-2 w-full bg-gradient-brand">Save Document</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
