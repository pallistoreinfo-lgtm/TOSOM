"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

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
    <form onSubmit={submit} className="admin-shell w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <LockKeyhole className="h-6 w-6" />
      </span>
      <h1 className="mt-5 text-3xl font-bold text-[#082a55]">Website Admin</h1>
      <p className="mt-2 text-sm text-slate-600">Sign in to manage pages, articles, podcasts, conditions, and lab tests.</p>
      <label htmlFor="password" className="mt-7 block text-sm font-semibold text-slate-700">Admin password</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mt-2 h-12 w-full rounded-lg border border-slate-300 px-4 outline-none ring-emerald-600 focus:ring-2"
      />
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="mt-5 h-12 w-full rounded-lg bg-[#07835e] font-semibold text-white transition hover:bg-[#096f53] disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
