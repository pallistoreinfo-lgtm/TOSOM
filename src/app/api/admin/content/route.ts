import matter from "gray-matter";
import { NextResponse } from "next/server";
import { isAdmin, isSameOrigin } from "@/lib/admin-auth";
import {
  deleteAdminFile,
  listAdminFiles,
  readAdminFile,
  validateContentPath,
  writeAdminFile,
} from "@/lib/admin-content";
import { schemaByCollection, type Collection } from "@/lib/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error.";
  return NextResponse.json({ error: message }, { status: 400 });
}

function validateDocument(filePath: string, raw: string) {
  if (Buffer.byteLength(raw, "utf8") > 1_000_000) {
    throw new Error("Content files must be smaller than 1 MB.");
  }
  if (filePath === "content/home.json") {
    const home = JSON.parse(raw) as Record<string, unknown>;
    for (const key of ["hero", "videos", "approach", "story", "gutPlan", "testimonials"]) {
      if (!(key in home)) throw new Error(`Homepage JSON is missing “${key}”.`);
    }
    return;
  }
  const collection = filePath.split("/")[1] as Collection;
  const parsedMatter = matter(raw);
  const result = schemaByCollection[collection].safeParse(parsedMatter.data);
  if (!result.success) {
    throw new Error(`Invalid page details: ${result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
  }
  const expectedSlug = filePath.split("/").at(-1)?.replace(/\.mdx$/, "");
  if (result.data.slug !== expectedSlug) {
    throw new Error(`The slug must be “${expectedSlug}” to match the filename.`);
  }
  if (collection === "blog" && result.data.type !== "blog") throw new Error("Article type must be blog.");
  if (collection === "podcast" && result.data.type !== "podcast") throw new Error("Podcast type must be podcast.");
  if (collection === "conditions" && result.data.type !== "condition") throw new Error("Condition type must be condition.");
  if (collection === "labtests" && result.data.type !== "labtest") throw new Error("Lab-test type must be labtest.");
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const filePath = new URL(request.url).searchParams.get("path");
    if (!filePath) return NextResponse.json({ files: await listAdminFiles() });
    const file = await readAdminFile(validateContentPath(filePath));
    return NextResponse.json(file);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = (await request.json()) as { path?: string; content?: string };
    if (!body.path || typeof body.content !== "string") throw new Error("Path and content are required.");
    const filePath = validateContentPath(body.path);
    validateDocument(filePath, body.content);
    const title = filePath === "content/home.json" ? "homepage" : matter(body.content).data.title || filePath;
    const result = await writeAdminFile(filePath, body.content, `content(admin): update ${title}`);
    return NextResponse.json({ ok: true, commit: result.commit.sha });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = (await request.json()) as { path?: string };
    if (!body.path) throw new Error("Path is required.");
    const filePath = validateContentPath(body.path);
    const result = await deleteAdminFile(filePath, `content(admin): delete ${filePath}`);
    return NextResponse.json({ ok: true, commit: result.commit.sha });
  } catch (error) {
    return errorResponse(error);
  }
}
