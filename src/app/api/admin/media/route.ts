import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/admin-auth";
import { deleteAdminMedia, listAdminMedia, writeAdminMedia } from "@/lib/admin-content";

export const runtime = "nodejs";

function detectedExtension(bytes: Buffer) {
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.subarray(0, 4).toString("ascii") === "GIF8") return "gif";
  if (bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    return NextResponse.json({ media: await listAdminMedia() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load media." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File)) throw new Error("Choose an image to upload.");
    const bytes = Buffer.from(await image.arrayBuffer());
    const extension = detectedExtension(bytes);
    if (!extension) throw new Error("Use a PNG, JPEG, WebP, or GIF image.");
    const cleanName = image.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 70) || "image";
    const filename = `${Date.now()}-${cleanName}.${extension}`;
    const repositoryPath = `public/assets/uploads/${filename}`;
    await writeAdminMedia(repositoryPath, bytes);
    return NextResponse.json({ ok: true, url: `/api/media/${filename}` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = (await request.json()) as { path?: string };
    if (!body.path) throw new Error("Image path is required.");
    await deleteAdminMedia(body.path);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed." }, { status: 400 });
  }
}
