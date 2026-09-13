import { cn } from "@/lib/utils";

export function Logo({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg viewBox="0 0 58 58" aria-hidden="true" className="h-full w-auto shrink-0">
        <path d="M13 8c12 1 20 8 21 18-11 1-20-5-21-18Z" fill="#59b8d5" />
        <path d="M47 7c-1 16-9 24-27 25 2-15 11-23 27-25Z" fill="#68cb78" />
        <path d="M15 21c-5 10-4 21 2 29 12 4 24-1 30-11-8 7-19 9-28 5-5-8-4-16 2-24Z" fill="#1266b1" />
        <path d="M18 36c8-9 17-14 29-17-12 7-21 13-29 17Z" fill="#edf8e9" />
      </svg>
      <span className={cn("text-[17px] font-bold leading-[1.05] tracking-[-0.02em]", onDark ? "text-white" : "text-[#082a55]")}>The Other Side<br />of Medicine</span>
    </span>
  );
}
