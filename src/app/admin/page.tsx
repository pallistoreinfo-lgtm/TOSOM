import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { AdminDashboard } from "./admin-dashboard";

export const metadata: Metadata = { title: "Content Manager", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminDashboard />;
}
