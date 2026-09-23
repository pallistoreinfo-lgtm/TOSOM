import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { site } from "@/config/site";

const socialPlatforms = [
  { label: "Facebook", href: site.social.facebook, icon: Facebook },
  { label: "YouTube", href: site.social.youtube, icon: Youtube },
  { label: "Instagram", href: site.social.instagram, icon: Instagram },
  { label: "LinkedIn", href: site.social.linkedin, icon: Linkedin },
  { label: "X", href: site.social.x, icon: Twitter },
];

/**
 * Compact author credentials card shown beneath every blog article. The
 * qualifications are limited to details supported by Dr. Krystosik's official
 * biography and professional profile.
 */
export function DoctorBio() {
  return (
    <aside
      aria-labelledby="doctor-profile-heading"
      className="ml-auto mt-12 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Image
            src="/assets/images/2025/04/IMG_2084npic-radio-scaled.jpg"
            alt="Dr. James Krystosik"
            width={88}
            height={88}
            className="h-20 w-20 shrink-0 rounded-full border-2 border-white object-cover shadow-sm sm:h-[88px] sm:w-[88px]"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">About the Author</p>
            <h2 id="doctor-profile-heading" className="mt-1 text-xl font-bold text-[#082f52]">
              Dr. James D. Krystosik, D.C.
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Chiropractor · Functional Medicine Practitioner · Author · Podcast Host
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Dr. J has worked in chiropractic and functional medicine since 1986, with a focus on nutrition,
          digestive health, and root-cause evaluation. He directs The Other Side of Medicine, has authored five
          books on nutrition and natural medicine, and hosts The Other Side of Medicine podcast.
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:p-6">
        <div>
          <h3 className="text-sm font-bold text-[#082f52]">Qualifications</h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-5 text-slate-600">
            <li>Doctor of Chiropractic, Life University</li>
            <li>Undergraduate degree in Nutrition</li>
            <li>Board-certified chiropractor</li>
            <li>In clinical practice since 1986</li>
          </ul>
          <Link href="/about/" className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
            Read Dr. J&apos;s full profile →
          </Link>
        </div>

        <div className="sm:min-w-40">
          <h3 className="text-sm font-bold text-[#082f52]">Social Platforms</h3>
          <div className="mt-2 flex flex-wrap gap-2 sm:max-w-36">
            {socialPlatforms.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Dr. J on ${label}`}
                title={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[#0b5f91] transition hover:border-[#0b5f91] hover:bg-[#0b5f91] hover:text-white"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
