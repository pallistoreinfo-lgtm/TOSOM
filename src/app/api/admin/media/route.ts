import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/admin-auth";
import { writeAdminMedia } from "@/lib/admin-content";

export const runtime = "nodejs";

const allowedTypes: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const form = await request.formData();
    const image = form.get("image");
    if (!(image instanceof File)) throw new Error("Choose an image to upload.");
    const extension = allowedTypes[image.type];
    if (!extension) throw new Error("Use a PNG, JPEG, WebP, or GIF image.");
    const cleanName = image.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 70) || "image";
    const filename = `${Date.now()}-${cleanName}.${extension}`;
    const repositoryPath = `public/assets/uploads/${filename}`;
    await writeAdminMedia(repositoryPath, Buffer.from(await image.arrayBuffer()));
    return NextResponse.json({ ok: true, url: `/assets/uploads/${filename}` });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
