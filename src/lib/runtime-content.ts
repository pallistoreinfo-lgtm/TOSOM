import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { schemaByCollection, type Collection } from "./schemas";
import type { ContentEntry } from "./content";

const PUBLISHED_STORE = ".cms/published.json";
type PublishedStore = Record<string, string>;

async function githubPublishedStore(): Promise<PublishedStore | null> {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) return null;
  const owner = process.env.GITHUB_OWNER || "pallistoreinfo-lgtm";
  const repo = process.env.GITHUB_REPO || "TOSOM";
  const branch = process.env.GITHUB_CONTENT_BRANCH || "cms-content";
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${PUBLISHED_STORE}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "TOSOM-Runtime-Content",
      },
      cache: "no-store",
    },
  );
  if (response.status === 404) return {};
  if (!response.ok) return null;
  const result = await response.json() as { content?: string };
  if (!result.content) return {};
  try {
    return JSON.parse(Buffer.from(result.content.replaceAll("\n", ""), "base64").toString("utf8")) as PublishedStore;
  } catch {
    return null;
  }
}

export async function getPublishedStore(): Promise<PublishedStore> {
  const remote = await githubPublishedStore();
  if (remote) return remote;
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), ".cms/published.json"), "utf8")) as PublishedStore;
  } catch {
    return {};
  }
}

export async function getRuntimeJson<T>(filePath: string, fallback: T): Promise<T> {
  const store = await getPublishedStore();
  const raw = store[filePath];
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function parseEntry(filePath: string, raw: string): ContentEntry<Record<string, unknown>> | null {
  const collection = filePath.split("/")[1] as Collection;
  const schema = schemaByCollection[collection];
  if (!schema) return null;
  const parsed = matter(raw);
  const normalized = schema.safeParse(parsed.data);
  if (!normalized.success) return null;
  return {
    frontmatter: normalized.data as unknown as Record<string, unknown>,
    body: parsed.content,
    slug: String(normalized.data.slug),
  };
}

export async function applyPublishedCollection<T extends { slug: string; draft?: boolean }>(
  collection: Collection,
  fallback: ContentEntry<T>[],
): Promise<ContentEntry<T>[]> {
  const store = await getPublishedStore();
  const entries = new Map(fallback.map((entry) => [entry.slug, entry]));
  const prefix = `content/${collection}/`;
  for (const [filePath, raw] of Object.entries(store)) {
    if (!filePath.startsWith(prefix) || !filePath.endsWith(".mdx")) continue;
    const parsed = parseEntry(filePath, raw);
    if (!parsed) continue;
    entries.set(parsed.slug, parsed as unknown as ContentEntry<T>);
  }
  return [...entries.values()].filter((entry) => !entry.frontmatter.draft);
}

export async function findPublishedEntry(slug: string) {
  const store = await getPublishedStore();
  for (const collection of ["blog", "pages", "conditions", "labtests", "podcast"] as Collection[]) {
    const filePath = `content/${collection}/${slug}.mdx`;
    if (!store[filePath]) continue;
    const entry = parseEntry(filePath, store[filePath]);
    if (entry) return { collection, entry };
  }
  return null;
}

