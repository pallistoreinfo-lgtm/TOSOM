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

function record(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
  return value as Record<string, unknown>;
}

function requiredStrings(value: Record<string, unknown>, keys: string[], label: string) {
  for (const key of keys) if (typeof value[key] !== "string") throw new Error(`${label}.${key} must be text.`);
}

function validateNav(value: unknown, label: string) {
  if (!Array.isArray(value)) throw new Error(`${label} must be a list.`);
  value.forEach((item, index) => {
    const nav = record(item, `${label}[${index}]`);
    requiredStrings(nav, ["label"], `${label}[${index}]`);
    if (nav.href !== undefined && typeof nav.href !== "string") throw new Error(`${label}[${index}].href must be text.`);
    if (nav.children !== undefined) validateNav(nav.children, `${label}[${index}].children`);
    if (!nav.href && !nav.children) throw new Error(`${label}[${index}] needs an href or children.`);
  });
}

function validateDocument(filePath: string, raw: string) {
  if (Buffer.byteLength(raw, "utf8") > 1_000_000) {
    throw new Error("Content files must be smaller than 1 MB.");
  }
  if (filePath === "content/home.json") {
    const home = record(JSON.parse(raw), "Homepage");
    requiredStrings(record(home.hero, "hero"), ["eyebrow", "line1", "line2", "line3", "description", "primaryButton", "secondaryButton"], "hero");
    requiredStrings(record(home.approach, "approach"), ["eyebrow", "title", "description", "button"], "approach");
    requiredStrings(record(home.story, "story"), ["eyebrow", "title", "description", "result", "link"], "story");
    for (const key of ["videos", "gutPlan", "testimonials"]) if (!Array.isArray(home[key])) throw new Error(`Homepage.${key} must be a list.`);
    (home.videos as unknown[]).forEach((item, index) => requiredStrings(record(item, `Homepage.videos[${index}]`), ["title", "youtubeId"], `Homepage.videos[${index}]`));
    return;
  }
  if (filePath === "content/site.json") {
    const settings = record(JSON.parse(raw), "Site settings");
    const site = record(settings.site, "site");
    requiredStrings(site, ["name", "url", "description"], "site");
    requiredStrings(record(site.contact, "site.contact"), ["phone", "phoneHref", "email", "emailHref"], "site.contact");
    validateNav(settings.mainNav, "mainNav");
    validateNav(settings.footerNav, "footerNav");
    requiredStrings(settings, ["footerTagline"], "settings");
    const actions = record(settings.headerActions, "headerActions");
    for (const key of ["quiz", "consultation", "shop"]) requiredStrings(record(actions[key], `headerActions.${key}`), ["label", "href"], `headerActions.${key}`);
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
    const safePath = validateContentPath(filePath);
    const file = await readAdminFile(safePath);
    if (safePath.endsWith(".mdx")) {
      const parsed = matter(file.content);
      const collection = safePath.split("/")[1] as Collection;
      const normalized = schemaByCollection[collection].safeParse(parsed.data);
      return NextResponse.json({ ...file, document: { frontmatter: normalized.success ? { ...parsed.data, ...normalized.data } : parsed.data, body: parsed.content } });
    }
    return NextResponse.json(file);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = (await request.json()) as { path?: string; content?: string; document?: { frontmatter?: Record<string, unknown>; body?: string } };
    if (!body.path) throw new Error("Path is required.");
    const filePath = validateContentPath(body.path);
    const content = body.document && body.document.frontmatter && typeof body.document.body === "string"
      ? matter.stringify(body.document.body, body.document.frontmatter)
      : body.content;
    if (typeof content !== "string") throw new Error("Path and content are required.");
    validateDocument(filePath, content);
    const title = filePath === "content/home.json" ? "homepage" : filePath === "content/site.json" ? "site settings" : matter(content).data.title || filePath;
    const result = await writeAdminFile(filePath, content, `content(admin): update ${title}`);
    return NextResponse.json({ ok: true, commit: result.commit.sha, content });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  try {
    const body = (await request.json()) as { sourcePath?: string; path?: string; title?: string };
    if (!body.sourcePath || !body.path || !body.title?.trim()) throw new Error("Source, destination, and title are required.");
    const sourcePath = validateContentPath(body.sourcePath);
    const destinationPath = validateContentPath(body.path);
    if (!sourcePath.endsWith(".mdx") || !destinationPath.endsWith(".mdx")) throw new Error("Only content pages can be duplicated.");
    if (sourcePath.split("/")[1] !== destinationPath.split("/")[1]) throw new Error("The duplicate must stay in the same collection.");
    try {
      await readAdminFile(destinationPath);
      throw new Error("Content with that slug already exists.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("404") && !message.includes("ENOENT")) throw error;
    }
    const source = await readAdminFile(sourcePath);
    const parsed = matter(source.content);
    const slug = destinationPath.split("/").at(-1)!.replace(/\.mdx$/, "");
    const frontmatter = { ...parsed.data, title: body.title.trim(), slug, date: new Date().toISOString() };
    if ("draft" in frontmatter) frontmatter.draft = true;
    const content = matter.stringify(parsed.content, frontmatter);
    validateDocument(destinationPath, content);
    const result = await writeAdminFile(destinationPath, content, `content(admin): duplicate ${body.title.trim()}`);
    return NextResponse.json({ ok: true, commit: result.commit.sha, path: destinationPath });
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
    if (filePath === "content/home.json" || filePath === "content/site.json") throw new Error("Required site configuration cannot be deleted.");
    const result = await deleteAdminFile(filePath, `content(admin): delete ${filePath}`);
    return NextResponse.json({ ok: true, commit: result.commit.sha });
  } catch (error) {
    return errorResponse(error);
  }
}
