import Image from "next/image";
import { site } from "@/config/site";

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt={site.name}
      width={1500}
      height={478}
      className={className}
      priority
    />
  );
}
