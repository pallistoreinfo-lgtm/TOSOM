"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Code2,
  Copy,
  ExternalLink,
  FilePlus2,
  ImagePlus,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { MediaLibrary } from "./media-library";
import { StructuredEditor, type StructuredDocument } from "./structured-editor";

type AdminFile = { path: string; size: number };
type Collection = "home" | "settings" | "pages" | "blog" | "podcast" | "conditions" | "labtests";

const collectionNames: Record<Collection, string> = {
  home: "Homepage",
  settings: "Site settings",
  pages: "Pages",
  blog: "Articles",
  podcast: "Podcasts",
  conditions: "Conditions",
  labtests: "Lab tests",
};

function collectionOf(filePath: string) {
  if (filePath === "content/home.json") return "home";
  if (filePath === "content/site.json") return "settings";
  return filePath.split("/")[1] as Collection;
}

function displayName(filePath: string) {
  if (filePath === "content/home.json") return "Homepage content";
  if (filePath === "content/site.json") return "Menu, contact & links";
  return filePath.split("/").at(-1)?.replace(/\.mdx$/, "").replaceAll("-", " ") || filePath;
}

function newDocument(collection: Collection, title: string, slug: string) {
  const date = new Date().toISOString();
  const common = `title: ${JSON.stringify(title)}\nslug: ${slug}\ndate: ${JSON.stringify(date)}\nexcerpt: ""`;
  if (collection === "blog") {
    return `---\ntype: blog\n${common}\ncategory: Health\ntags: []\nauthor: Dr. James Krystosik\ndraft: true\n---\n\n## ${title}\n\nStart writing here.\n`;
  }
  if (collection === "podcast") {
    return `---\ntype: podcast\n${common}\naudioUrl: ""\n---\n\n## ${title}\n\nAdd the episode description here.\n`;
  }
  const type = collection === "conditions" ? "condition" : collection === "labtests" ? "labtest" : "page";
  return `---\ntype: ${type}\n${common}\ndraft: true\n---\n\n## ${title}\n\nStart writing here.\n`;
}

export function AdminDashboard() {
  const [files, setFiles] = useState<AdminFile[]>([]);
  const [selected, setSelected] = useState("");
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState("");
  const [documentData, setDocumentData] = useState<StructuredDocument | null>(null);
  const [savedDocumentData, setSavedDocumentData] = useState<StructuredDocument | null>(null);
  const [editorMode, setEditorMode] = useState<"form" | "raw">("form");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [newCollection, setNewCollection] = useState<Collection>("pages");
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const rawDirty = content !== savedContent;
  const formDirty = JSON.stringify(documentData) !== JSON.stringify(savedDocumentData);
  const dirty = rawDirty || formDirty;

  async function api(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const result = (await response.json()) as Record<string, unknown>;
    if (response.status === 401) {
      window.location.href = "/admin/login";
      throw new Error("Your session expired.");
    }
    if (!response.ok) throw new Error(String(result.error || "Request failed."));
    return result;
  }

  async function loadFiles(preselect?: string) {
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/admin/content");
      const nextFiles = result.files as AdminFile[];
      setFiles(nextFiles);
      if (preselect) await openFile(preselect, true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load content.");
    } finally {
      setBusy(false);
    }
  }

  async function openFile(filePath: string, force = false) {
    if (!force && dirty && !window.confirm("Discard your unsaved changes?")) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await api(`/api/admin/content?path=${encodeURIComponent(filePath)}`);
      const raw = String(result.content);
      const structured = (result.document as StructuredDocument | undefined) || null;
      setSelected(filePath);
      setContent(raw);
      setSavedContent(raw);
      setDocumentData(structured);
      setSavedDocumentData(structured);
      setEditorMode(structured ? "form" : "raw");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open the file.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!selected || !dirty) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await api("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editorMode === "form" && documentData ? { path: selected, document: documentData } : { path: selected, content }),
      });
      const savedRaw = String(result.content || content);
      setContent(savedRaw);
      setSavedContent(savedRaw);
      setSavedDocumentData(documentData);
      if (editorMode === "raw" && selected.endsWith(".mdx")) await openFile(selected, true);
      else await loadFiles();
      setStatus("Saved to GitHub. Vercel will publish the change automatically.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function createFile() {
    const slug = newSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!newTitle.trim() || !slug) {
      setError("Enter a title and a valid slug.");
      return;
    }
    const filePath = `content/${newCollection}/${slug}.mdx`;
    if (files.some((file) => file.path === filePath)) {
      setError("A content item with that slug already exists.");
      return;
    }
    setSelected(filePath);
    setContent(newDocument(newCollection, newTitle.trim(), slug));
    setSavedContent("");
    setDocumentData(null);
    setSavedDocumentData(null);
    setEditorMode("raw");
    setShowCreate(false);
    setNewTitle("");
    setNewSlug("");
    setStatus("New draft created. Review it and select Save changes.");
  }

  async function remove() {
    if (selected === "content/home.json" || selected === "content/site.json") return;
    if (!selected || !window.confirm(`Permanently delete ${displayName(selected)} from GitHub?`)) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: selected }),
      });
      setSelected("");
      setContent("");
      setSavedContent("");
      setDocumentData(null);
      setSavedDocumentData(null);
      setStatus("Deleted from GitHub. Vercel will update automatically.");
      await loadFiles();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  async function duplicate() {
    if (!selected.endsWith(".mdx")) return;
    const currentTitle = String(documentData?.frontmatter.title || displayName(selected));
    const title = window.prompt("Title for the duplicate:", `${currentTitle} Copy`)?.trim();
    if (!title) return;
    const suggested = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = window.prompt("URL slug for the duplicate:", suggested)?.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) return;
    const collection = selected.split("/")[1];
    const destination = `content/${collection}/${slug}.mdx`;
    setBusy(true);
    setError("");
    try {
      const result = await api("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourcePath: selected, path: destination, title }),
      });
      await loadFiles(String(result.path));
      setStatus("Duplicate created as a draft.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Duplicate failed.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => { void loadFiles(); }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const grouped = useMemo(() => {
    const query = search.toLowerCase().trim();
    const groups = {} as Record<Collection, AdminFile[]>;
    (Object.keys(collectionNames) as Collection[]).forEach((key) => { groups[key] = []; });
    files.filter((file) => !query || displayName(file.path).toLowerCase().includes(query)).forEach((file) => groups[collectionOf(file.path)].push(file));
    return groups;
  }, [files, search]);

  const slug = selected.split("/").at(-1)?.replace(/\.mdx$/, "") || "";
  const previewUrl = selected === "content/home.json" || selected === "content/site.json" ? "/" : selected.startsWith("content/podcast/") ? `/podcasts/${slug}/` : `/${slug}/`;

  return (
    <div className="admin-shell min-h-screen bg-slate-100 text-slate-900">
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4">
          <div><h1 className="text-2xl font-bold text-[#082a55]">Content Manager</h1><p className="text-sm text-slate-500">The Other Side of Medicine</p></div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#07835e] px-4 text-sm font-semibold text-white"><FilePlus2 className="h-4 w-4" />New content</button>
            <button onClick={() => setShowMedia(true)} className="inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-semibold"><ImagePlus className="h-4 w-4" />Media library</button>
            <button onClick={logout} className="inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-semibold"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1500px] gap-5 p-5 lg:grid-cols-[310px_1fr]">
        <aside className="max-h-[calc(100vh-140px)] overflow-auto rounded-xl border bg-white p-4 shadow-sm">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search content…" className="h-10 w-full rounded-lg border pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600" /></div>
          <button onClick={() => loadFiles()} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"><RefreshCw className="h-3.5 w-3.5" />Refresh list</button>
          {(Object.keys(collectionNames) as Collection[]).map((collection) => (
            <section key={collection} className="mt-5">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">{collectionNames[collection]} ({grouped[collection].length})</h2>
              <div className="space-y-1">{grouped[collection].map((file) => <button key={file.path} onClick={() => openFile(file.path)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm capitalize ${selected === file.path ? "bg-emerald-50 font-semibold text-emerald-800" : "hover:bg-slate-50"}`}>{displayName(file.path)}</button>)}</div>
            </section>
          ))}
        </aside>

        <section className="min-w-0 rounded-xl border bg-white shadow-sm">
          {showCreate && <div className="border-b bg-emerald-50 p-5"><h2 className="font-bold text-emerald-900">Create new content</h2><div className="mt-3 grid gap-3 sm:grid-cols-3"><select value={newCollection} onChange={(event) => setNewCollection(event.target.value as Collection)} className="h-11 rounded-lg border px-3">{(Object.keys(collectionNames) as Collection[]).filter((key) => key !== "home" && key !== "settings").map((key) => <option key={key} value={key}>{collectionNames[key]}</option>)}</select><input value={newTitle} onChange={(event) => { setNewTitle(event.target.value); setNewSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} placeholder="Title" className="h-11 rounded-lg border px-3" /><input value={newSlug} onChange={(event) => setNewSlug(event.target.value)} placeholder="url-slug" className="h-11 rounded-lg border px-3" /></div><div className="mt-3 flex gap-2"><button onClick={createFile} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white">Create draft</button><button onClick={() => setShowCreate(false)} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">Cancel</button></div></div>}
          {error && <div role="alert" className="m-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {status && <div className="m-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{status}</div>}
          {!selected ? <div className="flex min-h-[520px] items-center justify-center p-8 text-center text-slate-500"><div><FilePlus2 className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-semibold">Choose content from the left</p><p className="mt-1 text-sm">or create a new page, article, podcast, condition, or lab test.</p></div></div> : <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
              <div className="min-w-0"><p className="truncate font-semibold capitalize">{displayName(selected)}</p><p className="truncate text-xs text-slate-500">{selected}{dirty ? " • Unsaved changes" : ""}</p></div>
              <div className="flex flex-wrap gap-2"><a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold"><ExternalLink className="h-4 w-4" />Preview</a>{selected.endsWith(".mdx") && <button onClick={duplicate} disabled={busy || dirty} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold disabled:opacity-50"><Copy className="h-4 w-4" />Duplicate</button>}{selected !== "content/home.json" && selected !== "content/site.json" && <button onClick={remove} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4" />Delete</button>}<button onClick={save} disabled={busy || !dirty} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#07835e] px-4 text-sm font-semibold text-white disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save changes</button></div>
            </div>
            {documentData && <div className="flex items-center gap-2 border-b bg-slate-50 px-5 py-3"><button onClick={() => setEditorMode("form")} disabled={dirty && editorMode !== "form"} className={`rounded-lg px-4 py-2 text-sm font-semibold ${editorMode === "form" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500"}`}>Easy editor</button><button onClick={() => setEditorMode("raw")} disabled={dirty && editorMode !== "raw"} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${editorMode === "raw" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500"}`}><Code2 className="h-4 w-4" />Advanced source</button>{dirty && <span className="ml-auto text-xs text-amber-700">Save before switching editors</span>}</div>}
            {editorMode === "form" && documentData ? <StructuredEditor document={documentData} onChange={setDocumentData} /> : <><div className="border-b bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-900"><strong>Advanced editor:</strong> {selected.endsWith(".json") ? "Edit text inside quotation marks, keeping the JSON punctuation intact." : <>Details between the two <code>---</code> lines control the title, URL, SEO, image, and draft status. The text below them is the page body using Markdown.</>}</div><textarea aria-label="Content editor" spellCheck className="min-h-[650px] w-full resize-y bg-[#fbfcfd] p-5 font-mono text-[14px] leading-6 outline-none" value={content} onChange={(event) => setContent(event.target.value)} /></>}
          </>}
        </section>
      </div>
      {showMedia && <MediaLibrary onClose={() => setShowMedia(false)} onStatus={(message) => { setStatus(message); setError(""); }} onError={(message) => setError(message)} />}
      {busy && <div className="pointer-events-none fixed bottom-5 right-5 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg"><LoaderCircle className="h-4 w-4 animate-spin" />Working…</div>}
    </div>
  );
}
