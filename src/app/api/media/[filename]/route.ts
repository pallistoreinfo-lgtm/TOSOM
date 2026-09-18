import { NextResponse } from "next/server";
import { readRuntimeMedia } from "@/lib/admin-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const { filename } = await params;
    const bytes = await readRuntimeMedia(filename);
    const extension = filename.split(".").at(-1)?.toLowerCase() || "";
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentTypes[extension] || "application/octet-stream",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Image not found.", { status: 404 });
  }
}
