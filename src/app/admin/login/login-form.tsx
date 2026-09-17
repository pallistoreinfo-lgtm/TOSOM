"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Login failed.");
      router.replace("/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_30px_90px_rgba(8,42,85,0.18)] md:grid-cols-[1.05fr_1fr]">
      <div className="hidden bg-gradient-to-br from-[#082f52] via-[#07546a] to-[#07835e] p-10 text-white md:block">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20"><ShieldCheck className="h-6 w-6" /></span>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">The Other Side of Medicine</p>
        <h1 className="mt-3 text-4xl font-bold leading-tight">Your website.<br />One control center.</h1>
        <p className="mt-4 text-sm leading-6 text-sky-100">Manage every page, article, podcast, image, menu link, and SEO setting without touching code.</p>
        <div className="mt-8 space-y-3 text-sm">{["Visual content editing", "GitHub-backed version history", "Automatic Vercel publishing"].map((item) => <p key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />{item}</p>)}</div>
      </div>
      <form onSubmit={submit} className="p-7 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 md:hidden"><LockKeyhole className="h-6 w-6" /></span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 md:mt-0">Secure access</p>
        <h2 className="mt-2 text-3xl font-bold text-[#082a55]">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to open the website control center.</p>
        <label htmlFor="password" className="mt-8 block text-sm font-semibold text-slate-700">Admin password</label>
        <div className="relative mt-2"><LockKeyhole className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" /><input id="password" type="password" autoComplete="current-password" required autoFocus value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 pl-12 pr-4 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></div>
        {error && <p role="alert" className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#07835e] font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-[#096f53] disabled:opacity-60">{busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{busy ? "Signing in…" : "Open control center"}</button>
        <p className="mt-5 text-center text-xs text-slate-400">Protected by an encrypted, time-limited admin session.</p>
      </form>
    </div>
  );
}
