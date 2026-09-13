import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <div className="flex min-h-[72vh] items-center justify-center bg-slate-50 px-4 py-14"><LoginForm /></div>;
}
