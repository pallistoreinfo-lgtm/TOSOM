import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin Login", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <div className="admin-shell flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#d9f4e9,_transparent_38%),linear-gradient(135deg,_#edf5f8,_#f8fbfc)] px-4 py-10"><LoginForm /></div>;
}
