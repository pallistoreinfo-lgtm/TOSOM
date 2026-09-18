"use client";

import { useState } from "react";
import { Monitor, Smartphone, MousePointer2 } from "lucide-react";
import type { StructuredDocument } from "./structured-editor";

type JsonObject = Record<string, unknown>;

function EditableText({ value, onChange, as: Tag = "div", className = "", multiline = false }: {
  value: string;
  onChange: (value: string) => void;
  as?: "div" | "p" | "h1" | "h2" | "h3" | "span";
  className?: string;
  multiline?: boolean;
}) {
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onBlur={(event) => onChange(multiline ? event.currentTarget.innerText : event.currentTarget.textContent || "")}
      className={`cursor-text rounded-md outline outline-2 outline-transparent transition hover:outline-emerald-300 focus:bg-emerald-50/80 focus:outline-emerald-500 ${className}`}
      title="Click to edit"
    >
      {value}
    </Tag>
  );
}

function BuilderFrame({ children, device, onDevice }: { children: React.ReactNode; device: "desktop" | "mobile"; onDevice: (value: "desktop" | "mobile") => void }) {
  return (
    <div className="bg-[#dfe8ec] p-3 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 shadow-sm">
        <p className="flex items-center gap-2 text-xs font-semibold text-slate-600"><MousePointer2 className="h-4 w-4 text-emerald-700" />Click any outlined text in the page to edit it.</p>
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button type="button" onClick={() => onDevice("desktop")} className={`rounded-md p-2 ${device === "desktop" ? "bg-white text-emerald-700 shadow" : "text-slate-500"}`} aria-label="Desktop preview"><Monitor className="h-4 w-4" /></button>
          <button type="button" onClick={() => onDevice("mobile")} className={`rounded-md p-2 ${device === "mobile" ? "bg-white text-emerald-700 shadow" : "text-slate-500"}`} aria-label="Mobile preview"><Smartphone className="h-4 w-4" /></button>
        </div>
      </div>
      <div className={`mx-auto overflow-hidden rounded-xl bg-white shadow-2xl transition-all ${device === "mobile" ? "max-w-[390px]" : "max-w-[1180px]"}`}>
        {children}
      </div>
    </div>
  );
}

export function VisualPageBuilder({ json, document, onJsonChange, onDocumentChange }: {
  json: JsonObject | null;
  document: StructuredDocument | null;
  onJsonChange: (value: JsonObject) => void;
  onDocumentChange: (value: StructuredDocument) => void;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  if (json && json.hero && json.approach && json.story) {
    const hero = json.hero as JsonObject;
    const approach = json.approach as JsonObject;
    const story = json.story as JsonObject;
    const videos = Array.isArray(json.videos) ? json.videos as JsonObject[] : [];
    const testimonials = Array.isArray(json.testimonials) ? json.testimonials as JsonObject[] : [];
    const updateSection = (section: string, key: string, value: unknown) => onJsonChange({ ...json, [section]: { ...(json[section] as JsonObject), [key]: value } });
    const updateArray = (section: string, index: number, key: string, value: string) => {
      const items = [...(json[section] as JsonObject[])];
      items[index] = { ...items[index], [key]: value };
      onJsonChange({ ...json, [section]: items });
    };
    return (
      <BuilderFrame device={device} onDevice={setDevice}>
        <div className="bg-[#f8f4ed] text-center text-[#082a55]">
          <div className="aspect-[2.05/1] bg-[url('/assets/home/gut-restoration-roadmap.webp')] bg-cover bg-center" />
          <div className="px-6 py-10">
            <EditableText as="p" value={String(hero.eyebrow || "")} onChange={(v) => updateSection("hero", "eyebrow", v)} className="mx-auto w-fit text-xs font-bold uppercase tracking-[.2em] text-emerald-700" />
            <EditableText as="h1" multiline value={`${String(hero.line1 || "")}\n${String(hero.line2 || "")} ${String(hero.line3 || "")}`} onChange={(value) => {
              const lines = value.split("\n");
              updateSection("hero", "line1", lines[0] || "");
              const rest = lines.slice(1).join(" ");
              onJsonChange({ ...json, hero: { ...hero, line1: lines[0] || "", line2: rest, line3: "" } });
            }} className="mx-auto mt-3 max-w-3xl whitespace-pre-line text-3xl font-extrabold leading-tight sm:text-5xl" />
            <EditableText as="p" multiline value={String(hero.description || "")} onChange={(v) => updateSection("hero", "description", v)} className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#365d81]" />
            <div className="mt-6 flex justify-center gap-3"><EditableText as="span" value={String(hero.primaryButton || "")} onChange={(v) => updateSection("hero", "primaryButton", v)} className="rounded-full bg-emerald-700 px-6 py-3 font-bold text-white" /><EditableText as="span" value={String(hero.secondaryButton || "")} onChange={(v) => updateSection("hero", "secondaryButton", v)} className="rounded-full border border-[#082a55] px-6 py-3 font-bold" /></div>
          </div>
        </div>
        <div className={`grid gap-3 p-5 ${device === "mobile" ? "grid-cols-1" : "grid-cols-4"}`}>
          {videos.map((video, index) => <div key={index} className="overflow-hidden rounded-xl border bg-white"><div className="aspect-video bg-slate-200" style={{ backgroundImage: `url(${String(video.thumbnail || "")})`, backgroundSize: "cover", backgroundPosition: "center" }} /><EditableText as="h3" multiline value={String(video.title || "")} onChange={(v) => updateArray("videos", index, "title", v)} className="m-3 text-sm font-bold text-[#083867]" /></div>)}
        </div>
        <div className={`grid items-center gap-8 bg-[#f7fcfd] p-8 ${device === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
          <div><EditableText as="p" value={String(approach.eyebrow || "")} onChange={(v) => updateSection("approach", "eyebrow", v)} className="w-fit text-xs font-bold uppercase tracking-widest text-sky-700" /><EditableText as="h2" multiline value={String(approach.title || "")} onChange={(v) => updateSection("approach", "title", v)} className="mt-3 text-3xl font-bold text-[#082a55]" /><EditableText as="p" multiline value={String(approach.description || "")} onChange={(v) => updateSection("approach", "description", v)} className="mt-4 leading-7 text-[#365d81]" /></div>
          <div className="aspect-[1.7/1] rounded-[60px_15px] bg-[url('/assets/home/healthy-food.png')] bg-cover bg-center" />
        </div>
        <div className={`grid gap-6 bg-[#effbfd] p-8 ${device === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
          <div><EditableText as="p" value={String(story.eyebrow || "")} onChange={(v) => updateSection("story", "eyebrow", v)} className="w-fit text-xs font-bold uppercase tracking-widest text-sky-700" /><EditableText as="h2" value={String(story.title || "")} onChange={(v) => updateSection("story", "title", v)} className="mt-2 text-3xl font-bold" /><EditableText as="p" multiline value={String(story.description || "")} onChange={(v) => updateSection("story", "description", v)} className="mt-3 leading-6 text-[#365d81]" /><EditableText as="p" multiline value={String(story.result || "")} onChange={(v) => updateSection("story", "result", v)} className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm" /></div>
          <div className="space-y-3">{testimonials.map((item, index) => <div key={index} className="rounded-xl bg-white p-4 shadow-sm"><EditableText as="p" multiline value={String(item.quote || "")} onChange={(v) => updateArray("testimonials", index, "quote", v)} className="text-sm leading-6 text-slate-600" /><EditableText as="p" value={String(item.name || "")} onChange={(v) => updateArray("testimonials", index, "name", v)} className="mt-3 w-fit font-bold" /></div>)}</div>
        </div>
      </BuilderFrame>
    );
  }

  if (document) {
    const fm = document.frontmatter;
    const updateFm = (key: string, value: string) => onDocumentChange({ ...document, frontmatter: { ...fm, [key]: value } });
    return (
      <BuilderFrame device={device} onDevice={setDevice}>
        <article className="min-h-[680px] bg-white px-6 py-12 text-[#153b60] sm:px-12">
          <div className="mx-auto max-w-3xl">
            <EditableText as="h1" multiline value={String(fm.title || "Untitled page")} onChange={(v) => updateFm("title", v)} className="text-4xl font-extrabold leading-tight" />
            <EditableText as="p" multiline value={String(fm.excerpt || "Click here to add a short page description.")} onChange={(v) => updateFm("excerpt", v)} className="mt-4 text-lg leading-7 text-slate-500" />
            <div className="my-8 h-px bg-slate-200" />
            <EditableText as="div" multiline value={document.body} onChange={(body) => onDocumentChange({ ...document, body })} className="min-h-[360px] whitespace-pre-wrap text-base leading-8 text-slate-700" />
          </div>
        </article>
      </BuilderFrame>
    );
  }

  return <div className="p-8 text-center text-sm text-slate-500">Visual page editing is available for pages and the homepage. Use the settings editor for site-wide navigation and contact details.</div>;
}

