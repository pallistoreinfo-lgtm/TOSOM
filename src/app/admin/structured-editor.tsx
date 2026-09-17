"use client";

import { useRef } from "react";
import { Bold, Heading2, Image as ImageIcon, Link, List, Quote } from "lucide-react";

export type StructuredDocument = { frontmatter: Record<string, unknown>; body: string };

const inputClass = "mt-1 h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-600";
const textareaClass = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-600";

function Field({ label, value, onChange, multiline = false, readOnly = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; readOnly?: boolean; type?: string }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}{multiline ? <textarea rows={3} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className={textareaClass} /> : <input type={type} value={value} readOnly={readOnly} onChange={(event) => onChange(event.target.value)} className={`${inputClass} ${readOnly ? "bg-slate-100 text-slate-500" : ""}`} />}</label>;
}

export function StructuredEditor({ document, onChange }: { document: StructuredDocument; onChange: (next: StructuredDocument) => void }) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fm = document.frontmatter;
  const update = (key: string, value: unknown) => onChange({ ...document, frontmatter: { ...fm, [key]: value } });
  const updateNested = (key: string, nestedKey: string, value: unknown) => update(key, { ...((fm[key] as Record<string, unknown>) || {}), [nestedKey]: value });
  const seo = (fm.seo as Record<string, unknown>) || {};
  const imageKey = fm.type === "podcast" ? "episodeImage" : "heroImage";
  const image = (fm[imageKey] as Record<string, unknown>) || {};
  const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
  const seoTitle = String(seo.metaTitle || fm.title || "");
  const seoDescription = String(seo.metaDescription || fm.excerpt || "");

  function insertMarkdown(before: string, after = "", placeholder = "text") {
    const textarea = bodyRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = document.body.slice(start, end) || placeholder;
    const nextBody = `${document.body.slice(0, start)}${before}${selected}${after}${document.body.slice(end)}`;
    onChange({ ...document, body: nextBody });
    requestAnimationFrame(() => { textarea.focus(); textarea.setSelectionRange(start + before.length, start + before.length + selected.length); });
  }

  return (
    <div className="space-y-7 p-5">
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Page details</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <Field label="Title" value={String(fm.title || "")} onChange={(value) => update("title", value)} />
          <Field label="URL slug" value={String(fm.slug || "")} onChange={() => {}} readOnly />
          {fm.date !== undefined && <Field label="Date" value={String(fm.date || "")} onChange={(value) => update("date", value)} />}
          {fm.category !== undefined && <Field label="Category" value={String(fm.category || "")} onChange={(value) => update("category", value)} />}
          {fm.author !== undefined && <Field label="Author" value={String(fm.author || "")} onChange={(value) => update("author", value)} />}
          {fm.duration !== undefined && <Field label="Duration" value={String(fm.duration || "")} onChange={(value) => update("duration", value)} />}
          {fm.audioUrl !== undefined && <div className="md:col-span-2"><Field label="Audio URL" value={String(fm.audioUrl || "")} onChange={(value) => update("audioUrl", value)} /></div>}
          <div className="md:col-span-2"><Field label="Short description / excerpt" value={String(fm.excerpt || "")} onChange={(value) => update("excerpt", value)} multiline /></div>
          {fm.tags !== undefined && <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Tags <input value={tags.join(", ")} onChange={(event) => update("tags", event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean))} placeholder="gut health, nutrition, wellness" className={inputClass} /><span className="mt-1 block text-xs font-normal text-slate-500">Separate tags with commas.</span></label>}
          {fm.draft !== undefined && <label className="flex items-center gap-3 rounded-lg border bg-slate-50 p-3 text-sm font-semibold"><input type="checkbox" checked={!Boolean(fm.draft)} onChange={(event) => update("draft", !event.target.checked)} className="h-5 w-5 accent-emerald-700" /><span><span className="block">Published</span><span className="font-normal text-slate-500">Turn off to keep this content hidden as a draft.</span></span></label>}
        </div>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Main image</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2"><Field label="Image URL" value={String(image.src || "")} onChange={(value) => update(imageKey, value ? { ...image, src: value } : undefined)} /><Field label="Image description (alt text)" value={String(image.alt || "")} onChange={(value) => updateNested(imageKey, "alt", value)} /></div>
        {Boolean(image.src) && <div className="mt-3 overflow-hidden rounded-xl border bg-slate-100"><img src={String(image.src)} alt={String(image.alt || "Preview")} className="max-h-64 w-full object-cover" /></div>}
        <p className="mt-2 text-xs text-slate-500">Use Media Library to upload an image, copy its URL, then paste it here.</p>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Search engine settings</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2"><Field label="SEO title" value={String(seo.metaTitle || "")} onChange={(value) => updateNested("seo", "metaTitle", value)} /><Field label="Canonical URL" value={String(seo.canonical || "")} onChange={(value) => updateNested("seo", "canonical", value)} /><div className="md:col-span-2"><Field label="SEO description" value={String(seo.metaDescription || "")} onChange={(value) => updateNested("seo", "metaDescription", value)} multiline /></div><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(seo.noindex)} onChange={(event) => updateNested("seo", "noindex", event.target.checked)} className="h-4 w-4 accent-emerald-700" />Hide this page from search engines</label></div>
        <div className="mt-4 rounded-xl border bg-white p-4 shadow-sm"><p className="truncate text-base font-semibold text-[#1a0dab]">{seoTitle || "Page title preview"}</p><p className="mt-1 truncate text-xs text-emerald-700">theothersideofmedicine.com/{String(fm.slug || "page")}/</p><p className="mt-1 line-clamp-2 text-sm text-slate-600">{seoDescription || "Add an SEO description to show search visitors what this page is about."}</p><div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold"><span className={`rounded-full px-2 py-1 ${seoTitle.length > 60 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>Title {seoTitle.length}/60</span><span className={`rounded-full px-2 py-1 ${seoDescription.length > 160 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>Description {seoDescription.length}/160</span></div></div>
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-700">Page content</h3>
        <p className="mt-1 text-xs text-slate-500">Use Markdown: ## heading, **bold**, [link text](https://example.com), and ![description](/image-url).</p>
        <div className="mt-3 flex flex-wrap gap-1 rounded-t-xl border border-b-0 bg-slate-50 p-2">
          <button type="button" onClick={() => insertMarkdown("## ", "", "Heading")} aria-label="Add heading" className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-800"><Heading2 className="h-4 w-4" /></button>
          <button type="button" onClick={() => insertMarkdown("**", "**", "bold text")} aria-label="Add bold text" className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-800"><Bold className="h-4 w-4" /></button>
          <button type="button" onClick={() => insertMarkdown("[", "](https://)", "link text")} aria-label="Add link" className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-800"><Link className="h-4 w-4" /></button>
          <button type="button" onClick={() => insertMarkdown("- ", "", "list item")} aria-label="Add list" className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-800"><List className="h-4 w-4" /></button>
          <button type="button" onClick={() => insertMarkdown("> ", "", "quote")} aria-label="Add quote" className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-800"><Quote className="h-4 w-4" /></button>
          <button type="button" onClick={() => insertMarkdown("![", "](/assets/uploads/image.webp)", "image description")} aria-label="Add image" className="rounded-lg p-2 text-slate-600 hover:bg-white hover:text-emerald-800"><ImageIcon className="h-4 w-4" /></button>
          <span className="ml-auto self-center px-2 text-xs text-slate-500">{document.body.trim() ? document.body.trim().split(/\s+/).length : 0} words</span>
        </div>
        <textarea ref={bodyRef} aria-label="Page body" rows={24} value={document.body} onChange={(event) => onChange({ ...document, body: event.target.value })} className="w-full rounded-b-xl border bg-[#fbfcfd] p-4 font-mono text-[14px] leading-6 outline-none focus:ring-2 focus:ring-emerald-600" />
      </section>
    </div>
  );
}
