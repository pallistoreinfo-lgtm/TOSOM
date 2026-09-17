"use client";

import { useEffect, useState } from "react";
import { Clipboard, ImagePlus, LoaderCircle, RefreshCw, Search, Trash2, X } from "lucide-react";

type MediaItem = { path: string; url: string; size: number };

export function MediaLibrary({ onClose, onStatus, onError }: { onClose: () => void; onStatus: (message: string) => void; onError: (message: string) => void }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [search, setSearch] = useState("");

  async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const result = (await response.json()) as Record<string, unknown>;
    if (response.status === 401) window.location.href = "/admin/login";
    if (!response.ok) throw new Error(String(result.error || "Request failed."));
    return result;
  }

  async function refresh() {
    setBusy(true);
    try {
      const result = await request("/api/admin/media");
      setMedia(result.media as MediaItem[]);
    } catch (error) {
      onError(error instanceof Error ? error.message : "Could not load media.");
    } finally {
      setBusy(false);
    }
  }

  async function upload(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.set("image", file);
      const result = await request("/api/admin/media", { method: "POST", body: form });
      const url = String(result.url);
      await navigator.clipboard?.writeText(url);
      onStatus(`Image uploaded and URL copied: ${url}`);
      await refresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: MediaItem) {
    if (!window.confirm(`Delete ${item.path.split("/").at(-1)}? Pages using it may show a broken image.`)) return;
    setBusy(true);
    try {
      await request("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: item.path }),
      });
      onStatus("Image deleted. Vercel will update automatically.");
      await refresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    onStatus(`Copied image URL: ${url}`);
  }

  useEffect(() => { void refresh(); }, []);
  const visibleMedia = media.filter((item) => item.path.toLowerCase().includes(search.toLowerCase().trim()));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4" role="dialog" aria-modal="true" aria-label="Media library">
      <div className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <div><h2 className="text-xl font-bold text-[#082a55]">Media library</h2><p className="text-sm text-slate-500">Upload, copy URLs, and manage admin-uploaded images.</p></div>
          <button onClick={onClose} aria-label="Close media library" className="rounded-lg p-2 hover:bg-slate-100"><X /></button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b bg-slate-50 px-5 py-3">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[#07835e] px-4 text-sm font-semibold text-white"><ImagePlus className="h-4 w-4" />Upload image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>
          <button onClick={refresh} className="inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-semibold"><RefreshCw className="h-4 w-4" />Refresh</button>
          <div className="relative min-w-[220px] flex-1 sm:ml-auto sm:max-w-xs"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search images…" className="h-10 w-full rounded-lg border bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600" /></div>
          <span className="text-sm text-slate-500">{visibleMedia.length} of {media.length}</span>
        </div>
        <div className="grid min-h-[300px] flex-1 gap-4 overflow-auto p-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleMedia.map((item) => <article key={item.path} className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="aspect-video bg-slate-100"><img src={item.url} alt="" className="h-full w-full object-cover" /></div><div className="p-3"><p className="truncate text-xs font-semibold" title={item.path}>{item.path.split("/").at(-1)}</p><p className="mt-1 text-xs text-slate-400">{Math.ceil(item.size / 1024)} KB · {item.url.split(".").at(-1)?.toUpperCase()}</p><div className="mt-3 flex gap-2"><button onClick={() => copy(item.url)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md border px-2 py-1.5 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-800"><Clipboard className="h-3.5 w-3.5" />Copy URL</button><button onClick={() => remove(item)} aria-label={`Delete ${item.path}`} className="rounded-md border border-red-200 px-2 text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button></div></div></article>)}
          {!busy && visibleMedia.length === 0 && <div className="col-span-full flex items-center justify-center text-sm text-slate-500">{media.length ? "No images match your search." : "No images have been uploaded through the admin panel yet."}</div>}
        </div>
        {busy && <div className="flex items-center justify-center gap-2 border-t p-3 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Working…</div>}
      </div>
    </div>
  );
}
