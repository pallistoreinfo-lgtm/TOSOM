"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Code2,
  Copy,
  ExternalLink,
  FilePlus2,
  FileText,
  FlaskConical,
  Home,
  ImagePlus,
  LoaderCircle,
  LogOut,
  Menu,
  Mic2,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  Search,
  Settings,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { JsonContentEditor } from "./json-content-editor";
import { MediaLibrary } from "./media-library";
import { StructuredEditor, type StructuredDocument } from "./structured-editor";
import { VisualPageBuilder } from "./visual-page-builder";

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

const collectionIcons: Record<Collection, typeof Home> = {
  home: Home,
  settings: Settings,
  pages: FileText,
  blog: BookOpen,
  podcast: Mic2,
  conditions: Stethoscope,
  labtests: FlaskConical,
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
  const [jsonData, setJsonData] = useState<Record<string, unknown> | null>(null);
  const [savedJsonData, setSavedJsonData] = useState<Record<string, unknown> | null>(null);
  const [editorMode, setEditorMode] = useState<"builder" | "form" | "visual" | "raw">("builder");
  const [isPublished, setIsPublished] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [newCollection, setNewCollection] = useState<Collection>("pages");
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const rawDirty = content !== savedContent;
  const formDirty = JSON.stringify(documentData) !== JSON.stringify(savedDocumentData);
  const jsonDirty = JSON.stringify(jsonData) !== JSON.stringify(savedJsonData);
  const dirty = rawDirty || formDirty || jsonDirty;

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
      const parsedJson = filePath.endsWith(".json") ? JSON.parse(raw) as Record<string, unknown> : null;
      setSelected(filePath);
      setContent(raw);
      setSavedContent(raw);
      setDocumentData(structured);
      setSavedDocumentData(structured);
      setJsonData(parsedJson);
      setSavedJsonData(parsedJson);
      setIsPublished(Boolean(result.published));
      setEditorMode(structured || filePath === "content/home.json" ? "builder" : parsedJson ? "visual" : "raw");
      setShowNavigator(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not open the file.");
    } finally {
      setBusy(false);
    }
  }

  function serializedPayload(mode: "draft" | "publish") {
    return editorMode === "form" || editorMode === "builder" ? (documentData
      ? { path: selected, document: documentData, mode }
      : jsonData ? { path: selected, content: `${JSON.stringify(jsonData, null, 2)}\n`, mode } : { path: selected, content, mode })
      : editorMode === "visual" && jsonData
        ? { path: selected, content: `${JSON.stringify(jsonData, null, 2)}\n`, mode }
        : { path: selected, content, mode };
  }

  async function save(mode: "draft" | "publish" = "draft") {
    if (!selected || (mode === "draft" && !dirty)) return;
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await api("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializedPayload(mode)),
      });
      const savedRaw = String(result.content || content);
      setContent(savedRaw);
      setSavedContent(savedRaw);
      setSavedDocumentData(documentData);
      setSavedJsonData(jsonData);
      if (editorMode === "raw" && selected.endsWith(".mdx")) await openFile(selected, true);
      else if (editorMode === "raw" && selected.endsWith(".json")) {
        const parsed = JSON.parse(savedRaw) as Record<string, unknown>;
        setJsonData(parsed);
        setSavedJsonData(parsed);
      }
      else await loadFiles();
      if (mode === "publish") setIsPublished(true);
      setStatus(mode === "publish"
        ? "Published. The live website is updated without a Vercel deployment."
        : "Draft saved privately. The live website has not changed.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : mode === "publish" ? "Publish failed." : "Save failed.");
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
    setJsonData(null);
    setSavedJsonData(null);
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
      setJsonData(null);
      setSavedJsonData(null);
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
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!busy && dirty) void save("draft");
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  });

  const grouped = useMemo(() => {
    const query = search.toLowerCase().trim();
    const groups = {} as Record<Collection, AdminFile[]>;
    (Object.keys(collectionNames) as Collection[]).forEach((key) => { groups[key] = []; });
    files.filter((file) => !query || displayName(file.path).toLowerCase().includes(query)).forEach((file) => groups[collectionOf(file.path)].push(file));
    return groups;
  }, [files, search]);

  const slug = selected.split("/").at(-1)?.replace(/\.mdx$/, "") || "";
  const previewUrl = selected === "content/home.json" || selected === "content/site.json" ? "/" : selected.startsWith("content/podcast/") ? `/podcasts/${slug}/` : `/${slug}/`;

  function resetChanges() {
    if (!dirty || !window.confirm("Reset all unsaved changes for this item?")) return;
    setContent(savedContent);
    setDocumentData(savedDocumentData);
    setJsonData(savedJsonData);
    setStatus("Unsaved changes were reset.");
  }

  async function copyPreviewUrl() {
    const absolute = `${window.location.origin}${previewUrl}`;
    await navigator.clipboard.writeText(absolute);
    setStatus(`Copied page URL: ${absolute}`);
  }

  return (
    <div className="admin-shell min-h-screen bg-[#eef4f7] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-[#072d50] via-[#084d68] to-[#08765f] text-white shadow-lg">
        <div className="mx-auto flex max-w-[1580px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setShowNavigator(true)} className="rounded-xl border border-white/20 p-2 lg:hidden" aria-label="Open content navigator"><Menu className="h-5 w-5" /></button>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20"><BarChart3 className="h-5 w-5" /></div>
            <div className="min-w-0"><h1 className="truncate text-lg font-bold sm:text-xl">Website Control Center</h1><p className="truncate text-xs text-sky-100">The Other Side of Medicine · {files.length} content items</p></div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCreate(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-bold text-[#075b52] shadow-sm hover:bg-emerald-50 sm:px-4"><FilePlus2 className="h-4 w-4" /><span className="hidden sm:inline">New content</span></button>
            <button onClick={() => setShowMedia(true)} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold hover:bg-white/20 sm:px-4"><ImagePlus className="h-4 w-4" /><span className="hidden md:inline">Media</span></button>
            <button onClick={logout} aria-label="Sign out" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 text-sm font-semibold hover:bg-white/20"><LogOut className="h-4 w-4" /><span className="hidden xl:inline">Sign out</span></button>
          </div>
        </div>
      </header>

      {showNavigator && <button className="fixed inset-0 z-40 bg-slate-950/55 lg:hidden" onClick={() => setShowNavigator(false)} aria-label="Close content navigator overlay" />}
      <main className="mx-auto grid max-w-[1580px] gap-5 p-4 sm:p-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className={`${showNavigator ? "fixed inset-y-0 left-0 z-50 block w-[88vw] max-w-sm" : "hidden"} overflow-auto border-r bg-white p-4 shadow-2xl lg:sticky lg:top-[92px] lg:block lg:h-[calc(100vh-116px)] lg:w-auto lg:rounded-2xl lg:border lg:shadow-sm`}>
          <div className="mb-4 flex items-center justify-between lg:hidden"><p className="font-bold text-[#082a55]">Content navigator</p><button onClick={() => setShowNavigator(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close navigator"><X className="h-5 w-5" /></button></div>
          <div className="relative"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search all content…" className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-100" /></div>
          <div className="mt-3 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{files.length} total items</span><button onClick={() => loadFiles()} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"><RefreshCw className="h-3.5 w-3.5" />Refresh</button></div>
          {(Object.keys(collectionNames) as Collection[]).map((collection) => {
            const Icon = collectionIcons[collection];
            return <section key={collection} className="mt-5">
              <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Icon className="h-3.5 w-3.5" />{collectionNames[collection]}<span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{grouped[collection].length}</span></h2>
              <div className="space-y-1">{grouped[collection].map((file) => <button key={file.path} onClick={() => openFile(file.path)} className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm capitalize transition ${selected === file.path ? "bg-gradient-to-r from-emerald-50 to-sky-50 font-bold text-emerald-800 ring-1 ring-emerald-100" : "text-slate-700 hover:bg-slate-50"}`}><span className="line-clamp-2">{displayName(file.path)}</span></button>)}</div>
            </section>;
          })}
        </aside>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,45,65,0.07)]">
          {showCreate && <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-sky-50 p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold text-emerald-900">Create new content</h2><p className="mt-1 text-xs text-slate-600">It starts as a draft so you can review it safely.</p></div><button onClick={() => setShowCreate(false)} className="rounded-lg p-2 hover:bg-white" aria-label="Close create panel"><X className="h-4 w-4" /></button></div><div className="mt-4 grid gap-3 md:grid-cols-3"><select value={newCollection} onChange={(event) => setNewCollection(event.target.value as Collection)} className="h-11 rounded-xl border px-3 text-sm">{(Object.keys(collectionNames) as Collection[]).filter((key) => key !== "home" && key !== "settings").map((key) => <option key={key} value={key}>{collectionNames[key]}</option>)}</select><input value={newTitle} onChange={(event) => { setNewTitle(event.target.value); setNewSlug(event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")); }} placeholder="Title" className="h-11 rounded-xl border px-3 text-sm" /><input value={newSlug} onChange={(event) => setNewSlug(event.target.value)} placeholder="url-slug" className="h-11 rounded-xl border px-3 text-sm" /></div><button onClick={createFile} className="mt-3 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm">Create draft</button></div>}
          {error && <div role="alert" className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {status && <div className="m-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{status}</div>}

          {!selected ? <div className="p-5 sm:p-8">
            <div className="rounded-2xl bg-gradient-to-br from-[#082f52] to-[#08765f] p-6 text-white sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Content overview</p><h2 className="mt-2 text-3xl font-bold">Everything in one place</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-sky-100">Open a page in the visual builder, click its text to edit, save a private draft, then publish when it is ready. Content publishing does not rebuild the website.</p><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => setShowCreate(true)} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#075b52]">Create content</button><button onClick={() => setShowMedia(true)} className="rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-bold">Open media library</button></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{(["pages", "blog", "podcast", "conditions"] as Collection[]).map((collection) => { const Icon = collectionIcons[collection]; return <button key={collection} onClick={() => setShowNavigator(true)} className="rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5" /></span><strong className="mt-4 block text-2xl text-[#082a55]">{grouped[collection].length}</strong><span className="text-sm text-slate-500">{collectionNames[collection]}</span></button>; })}</div>
          </div> : <>
            <div className="border-b bg-white px-4 py-4 sm:px-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-lg font-bold capitalize text-[#082a55]">{displayName(selected)}</p>{dirty ? <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">Unsaved changes</span> : <span className="rounded-full bg-sky-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">Draft saved</span>}{isPublished && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Live</span>}</div><p className="mt-1 truncate text-xs text-slate-500">{selected}</p></div>
                <div className="flex flex-wrap gap-2"><a href={previewUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold hover:bg-slate-50"><ExternalLink className="h-4 w-4" />Live page</a><button onClick={copyPreviewUrl} className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold hover:bg-slate-50" title="Copy public page URL"><Copy className="h-4 w-4" /><span className="hidden sm:inline">Copy URL</span></button>{dirty && <button onClick={resetChanges} className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold text-amber-800 hover:bg-amber-50"><RotateCcw className="h-4 w-4" />Reset</button>}{selected.endsWith(".mdx") && <button onClick={duplicate} disabled={busy || dirty} className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-semibold disabled:opacity-50"><Copy className="h-4 w-4" /><span className="hidden xl:inline">Duplicate</span></button>}{selected !== "content/home.json" && selected !== "content/site.json" && <button onClick={remove} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-50"><Trash2 className="h-4 w-4" /><span className="hidden xl:inline">Delete</span></button>}<button onClick={() => save("draft")} disabled={busy || !dirty} className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-700 bg-white px-4 text-sm font-bold text-emerald-800 disabled:cursor-not-allowed disabled:opacity-40">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save draft</button><button onClick={() => save("publish")} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#07835e] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#096f53] disabled:opacity-40"><Send className="h-4 w-4" />Publish</button></div>
              </div>
              <p className="mt-3 text-[11px] text-slate-400">Save draft keeps the work private. Publish updates the live page immediately—no Vercel deployment.</p>
            </div>

            {(documentData || jsonData) && <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 px-4 py-3 sm:px-5">{(documentData || selected === "content/home.json") && <button onClick={() => setEditorMode("builder")} disabled={dirty && editorMode !== "builder"} className={`rounded-xl px-4 py-2 text-sm font-bold ${editorMode === "builder" ? "bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200" : "text-slate-500"}`}>Visual page builder</button>}{documentData && <button onClick={() => setEditorMode("form")} disabled={dirty && editorMode !== "form"} className={`rounded-xl px-4 py-2 text-sm font-bold ${editorMode === "form" ? "bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200" : "text-slate-500"}`}>Page settings</button>}{jsonData && <button onClick={() => setEditorMode("visual")} disabled={dirty && editorMode !== "visual"} className={`rounded-xl px-4 py-2 text-sm font-bold ${editorMode === "visual" ? "bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200" : "text-slate-500"}`}>All fields</button>}<button onClick={() => setEditorMode("raw")} disabled={dirty && editorMode !== "raw"} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${editorMode === "raw" ? "bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200" : "text-slate-500"}`}><Code2 className="h-4 w-4" />Advanced source</button>{dirty && <span className="ml-auto text-xs font-semibold text-amber-700">Save or reset before switching modes</span>}</div>}

            {editorMode === "builder" ? <VisualPageBuilder json={selected === "content/home.json" ? jsonData : null} document={documentData} onJsonChange={setJsonData} onDocumentChange={setDocumentData} /> : editorMode === "form" && documentData ? <StructuredEditor document={documentData} onChange={setDocumentData} /> : editorMode === "visual" && jsonData ? <JsonContentEditor value={jsonData} onChange={setJsonData} /> : <><div className="border-b bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-900"><strong>Advanced source:</strong> Use this only when you need direct control over the file syntax. Invalid formatting will be rejected before saving.</div><textarea aria-label="Content editor" spellCheck={false} className="min-h-[680px] w-full resize-y bg-[#0e1b2a] p-5 font-mono text-[14px] leading-6 text-slate-100 outline-none" value={content} onChange={(event) => setContent(event.target.value)} /></>}
          </>}
        </section>
      </main>
      {showMedia && <MediaLibrary onClose={() => setShowMedia(false)} onStatus={(message) => { setStatus(message); setError(""); }} onError={(message) => setError(message)} />}
      {busy && <div className="pointer-events-none fixed bottom-5 right-5 z-[120] flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm text-white shadow-xl"><LoaderCircle className="h-4 w-4 animate-spin" />Working…</div>}
    </div>
  );
}
