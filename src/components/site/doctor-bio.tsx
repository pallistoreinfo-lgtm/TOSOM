import Link from "next/link";
import { site } from "@/config/site";

/**
 * Author credentials block. Rendered on every blog article for YMYL E-E-A-T
 * (visible author expertise per page, not just the homepage) — paired with the
 * Person author JSON-LD emitted in the article route.
 */
export function DoctorBio() {
  return (
    <aside className="mt-12 rounded-lg border bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">About the Author</p>
      <h2 className="mt-1 text-lg font-semibold text-secondary">{site.doctor.name}</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {site.doctor.credentials}. Northeast Ohio&apos;s functional medicine expert, in practice since{" "}
        {site.doctor.practicingSince}, having helped over 13,000 patients reclaim their health without drugs
        or surgery.
      </p>
      <Link href="/about/" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
        Read Dr. Krystosik&apos;s full bio →
      </Link>
    </aside>
  );
}
