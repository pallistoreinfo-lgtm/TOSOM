import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return <Image src="/logo.png" alt="The Other Side of Medicine" width={1500} height={500} priority className={cn("h-auto w-[190px] object-contain", className)} />;
}
