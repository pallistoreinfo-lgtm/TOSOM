"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type JsonObject = Record<string, unknown>;

const humanize = (key: string) => key
  .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
  .replaceAll("_", " ")
  .replace(/^./, (letter) => letter.toUpperCase());

function blankLike(value: unknown): unknown {
  if (typeof value === "string") return "";
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value as JsonObject).map((key) => [key, blankLike((value as JsonObject)[key])]));
  }
  return "";
}

function PrimitiveField({ fieldKey, value, onChange }: { fieldKey: string; value: string | number | boolean | null; onChange: (value: unknown) => void }) {
  const label = humanize(fieldKey);
  if (typeof value === "boolean") {
    return <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"><span>{label}</span><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-emerald-700" /></label>;
  }
  const text = value === null ? "" : String(value);
  const multiline = text.length > 90 || /description|quote|result|tagline|message|text/i.test(fieldKey);
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {multiline ? <textarea rows={3} value={text} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /> : <input type={typeof value === "number" ? "number" : "text"} value={text} onChange={(event) => onChange(typeof value === "number" ? Number(event.target.value) : event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />}
    </label>
  );
}

function ObjectFields({ value, onChange, depth = 0 }: { value: JsonObject; onChange: (value: JsonObject) => void; depth?: number }) {
  return <div className={depth ? "grid gap-4 md:grid-cols-2" : "space-y-4"}>{Object.entries(value).map(([key, item]) => {
    const update = (next: unknown) => onChange({ ...value, [key]: next });
    if (Array.isArray(item)) return <div key={key} className="md:col-span-2"><ArrayField fieldKey={key} value={item} onChange={update} depth={depth + 1} /></div>;
    if (item && typeof item === "object") return <div key={key} className="md:col-span-2"><NestedObject fieldKey={key} value={item as JsonObject} onChange={update} depth={depth + 1} /></div>;
    return <PrimitiveField key={key} fieldKey={key} value={item as string | number | boolean | null} onChange={update} />;
  })}</div>;
}

function NestedObject({ fieldKey, value, onChange, depth }: { fieldKey: string; value: JsonObject; onChange: (value: JsonObject) => void; depth: number }) {
  return (
    <details open={depth < 2} className="group rounded-2xl border border-slate-200 bg-slate-50/70">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-bold text-[#123b63] marker:hidden">
        {humanize(fieldKey)}<ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div className="border-t border-slate-200 p-4"><ObjectFields value={value} onChange={onChange} depth={depth} /></div>
    </details>
  );
}

function ArrayField({ fieldKey, value, onChange, depth }: { fieldKey: string; value: unknown[]; onChange: (value: unknown[]) => void; depth: number }) {
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const add = () => onChange([...value, value.length ? blankLike(value[value.length - 1]) : ""]);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div><h4 className="text-sm font-bold text-[#123b63]">{humanize(fieldKey)}</h4><p className="text-xs text-slate-500">{value.length} item{value.length === 1 ? "" : "s"}</p></div>
        <button type="button" onClick={add} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100"><Plus className="h-3.5 w-3.5" />Add item</button>
      </div>
      <div className="space-y-3 p-4">
        {value.map((item, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#0b3d74] px-2.5 py-1 text-[11px] font-bold text-white">#{index + 1}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${humanize(fieldKey)} item ${index + 1} up`} className="rounded-md border bg-white p-1.5 text-slate-600 disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === value.length - 1} aria-label={`Move ${humanize(fieldKey)} item ${index + 1} down`} className="rounded-md border bg-white p-1.5 text-slate-600 disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${humanize(fieldKey)} item ${index + 1}`} className="rounded-md border border-red-200 bg-white p-1.5 text-red-700"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            {item && typeof item === "object" && !Array.isArray(item) ? <ObjectFields value={item as JsonObject} onChange={(next) => onChange(value.map((current, itemIndex) => itemIndex === index ? next : current))} depth={depth} /> : <PrimitiveField fieldKey={`${fieldKey} ${index + 1}`} value={item as string | number | boolean | null} onChange={(next) => onChange(value.map((current, itemIndex) => itemIndex === index ? next : current))} />}
          </div>
        ))}
        {!value.length && <p className="py-5 text-center text-sm text-slate-500">No items yet. Select “Add item” to create one.</p>}
      </div>
    </div>
  );
}

export function JsonContentEditor({ value, onChange }: { value: JsonObject; onChange: (value: JsonObject) => void }) {
  return (
    <div className="space-y-5 p-5 lg:p-7">
      <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"><strong>Visual editor:</strong> Update text, links, contact details, lists, and images safely. Reorder list items with the arrow controls.</div>
      {Object.entries(value).map(([key, item]) => {
        const update = (next: unknown) => onChange({ ...value, [key]: next });
        if (Array.isArray(item)) return <ArrayField key={key} fieldKey={key} value={item} onChange={update} depth={0} />;
        if (item && typeof item === "object") return <NestedObject key={key} fieldKey={key} value={item as JsonObject} onChange={update} depth={0} />;
        return <PrimitiveField key={key} fieldKey={key} value={item as string | number | boolean | null} onChange={update} />;
      })}
    </div>
  );
}
