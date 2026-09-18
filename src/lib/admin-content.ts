import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_PATH = /^(?:content\/(?:home|site)\.json|content\/(pages|blog|podcast|conditions|labtests)\/[a-z0-9][a-z0-9-]*\.mdx)$/;
const MEDIA_PATH = /^public\/assets\/uploads\/[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp|gif)$/;
const COLLECTION_ROOTS = [
  "content/pages/",
  "content/blog/",
  "content/podcast/",
  "content/conditions/",
  "content/labtests/",
];

export type AdminFile = { path: string; size: number };
export type AdminMedia = AdminFile & { url: string };

export function validateContentPath(filePath: string) {
  const normalized = filePath.replaceAll("\\", "/");
  if (!CONTENT_PATH.test(normalized)) throw new Error("Invalid content path.");
  return normalized;
}

function githubConfig() {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) return null;
  return {
    token,
    owner: process.env.GITHUB_OWNER || "pallistoreinfo-lgtm",
    repo: process.env.GITHUB_REPO || "TOSOM",
    branch: process.env.GITHUB_BRANCH || "main",
    contentBranch: process.env.GITHUB_CONTENT_BRANCH || "cms-content",
  };
}

const DRAFT_STORE = ".cms/drafts.json";
const PUBLISHED_STORE = ".cms/published.json";
type ContentStore = Record<string, string>;

async function readLocalStore(kind: "draft" | "published"): Promise<ContentStore> {
  try {
    return JSON.parse(await fs.readFile(path.join(process.cwd(), `.cms/${kind === "draft" ? "drafts" : "published"}.json`), "utf8")) as ContentStore;
  } catch {
    return {};
  }
}

async function writeLocalStore(kind: "draft" | "published", store: ContentStore) {
  await fs.mkdir(path.join(process.cwd(), ".cms"), { recursive: true });
  await fs.writeFile(
    path.join(process.cwd(), `.cms/${kind === "draft" ? "drafts" : "published"}.json`),
    `${JSON.stringify(store, null, 2)}\n`,
    "utf8",
  );
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "TOSOM-Admin",
  };
}

async function githubRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const config = githubConfig();
  if (!config) throw new Error("GitHub is not configured.");
  const response = await fetch(url, {
    ...init,
    headers: { ...githubHeaders(config.token), ...init?.headers },
    cache: "no-store",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub returned ${response.status}: ${detail.slice(0, 300)}`);
  }
  return (await response.json()) as T;
}

async function ensureContentBranch() {
  const config = githubConfig();
  if (!config) return;
  const refUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/git/ref/heads/${encodeURIComponent(config.contentBranch)}`;
  try {
    await githubRequest<unknown>(refUrl);
    return;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("404")) throw error;
  }
  const mainRef = await githubRequest<{ object: { sha: string } }>(
    `https://api.github.com/repos/${config.owner}/${config.repo}/git/ref/heads/${encodeURIComponent(config.branch)}`,
  );
  await githubRequest<unknown>(`https://api.github.com/repos/${config.owner}/${config.repo}/git/refs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref: `refs/heads/${config.contentBranch}`, sha: mainRef.object.sha }),
  });
}

async function readRepoFile(repositoryPath: string, branch: string) {
  const config = githubConfig();
  if (!config) throw new Error("GitHub is not configured.");
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${repositoryPath}?ref=${encodeURIComponent(branch)}`;
  const result = await githubRequest<{ content: string; sha: string }>(url);
  return {
    content: Buffer.from(result.content.replaceAll("\n", ""), "base64").toString("utf8"),
    sha: result.sha,
  };
}

async function writeRepoFile(repositoryPath: string, branch: string, content: string, message: string) {
  const config = githubConfig();
  if (!config) throw new Error("GitHub is not configured.");
  let sha: string | undefined;
  try {
    sha = (await readRepoFile(repositoryPath, branch)).sha;
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("404")) throw error;
  }
  return githubRequest<{ commit: { sha: string } }>(
    `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${repositoryPath}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        branch,
        ...(sha ? { sha } : {}),
      }),
    },
  );
}

async function readStore(kind: "draft" | "published"): Promise<ContentStore> {
  const config = githubConfig();
  if (!config) return {};
  await ensureContentBranch();
  try {
    const file = await readRepoFile(kind === "draft" ? DRAFT_STORE : PUBLISHED_STORE, config.contentBranch);
    const parsed = JSON.parse(file.content) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as ContentStore : {};
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) return {};
    throw error;
  }
}

async function writeStore(kind: "draft" | "published", store: ContentStore, message: string) {
  const config = githubConfig();
  if (!config) throw new Error("GitHub is not configured.");
  await ensureContentBranch();
  return writeRepoFile(
    kind === "draft" ? DRAFT_STORE : PUBLISHED_STORE,
    config.contentBranch,
    `${JSON.stringify(store, null, 2)}\n`,
    message,
  );
}

export async function listAdminFiles(): Promise<AdminFile[]> {
  const config = githubConfig();
  if (config) {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${encodeURIComponent(config.branch)}?recursive=1`;
    const result = await githubRequest<{ tree: Array<{ path: string; type: string; size?: number }> }>(url);
    const sourceFiles = result.tree
      .filter((item) => item.type === "blob" && CONTENT_PATH.test(item.path))
      .map((item) => ({ path: item.path, size: item.size || 0 }))
    const [drafts, published] = await Promise.all([readStore("draft"), readStore("published")]);
    const byPath = new Map(sourceFiles.map((file) => [file.path, file]));
    for (const [filePath, content] of Object.entries({ ...published, ...drafts })) {
      if (CONTENT_PATH.test(filePath)) byPath.set(filePath, { path: filePath, size: Buffer.byteLength(content, "utf8") });
    }
    return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
  }

  const files: AdminFile[] = [];
  const homeStat = await fs.stat(path.join(process.cwd(), "content/home.json"));
  files.push({ path: "content/home.json", size: homeStat.size });
  const siteStat = await fs.stat(path.join(process.cwd(), "content/site.json"));
  files.push({ path: "content/site.json", size: siteStat.size });
  for (const root of COLLECTION_ROOTS) {
    const directory = path.join(process.cwd(), root);
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
      const filePath = `${root}${entry.name}`;
      const stat = await fs.stat(path.join(process.cwd(), filePath));
      files.push({ path: filePath, size: stat.size });
    }
  }
  const [drafts, published] = await Promise.all([readLocalStore("draft"), readLocalStore("published")]);
  const byPath = new Map(files.map((file) => [file.path, file]));
  for (const [filePath, content] of Object.entries({ ...published, ...drafts })) {
    if (CONTENT_PATH.test(filePath)) byPath.set(filePath, { path: filePath, size: Buffer.byteLength(content, "utf8") });
  }
  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export async function readAdminFile(filePath: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (config) {
    const [drafts, published] = await Promise.all([readStore("draft"), readStore("published")]);
    if (drafts[safePath] !== undefined) return { content: drafts[safePath], sha: "draft", state: "draft" as const, published: published[safePath] !== undefined };
    if (published[safePath] !== undefined) return { content: published[safePath], sha: "published", state: "published" as const, published: true };
    const result = await readRepoFile(safePath, config.branch);
    return { ...result, state: "source" as const, published: false };
  }
  const [drafts, published] = await Promise.all([readLocalStore("draft"), readLocalStore("published")]);
  if (drafts[safePath] !== undefined) return { content: drafts[safePath], sha: "local-draft", state: "draft" as const, published: published[safePath] !== undefined };
  if (published[safePath] !== undefined) return { content: published[safePath], sha: "local-published", state: "published" as const, published: true };
  return {
    content: await fs.readFile(path.join(process.cwd(), safePath), "utf8"),
    sha: "local",
  };
}

/** Save work privately without changing the live site or triggering a Vercel deployment. */
export async function writeAdminDraft(filePath: string, content: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (!config) {
    const store = await readLocalStore("draft");
    store[safePath] = content;
    await writeLocalStore("draft", store);
    return { commit: { sha: "local-draft" } };
  }
  const store = await readStore("draft");
  store[safePath] = content;
  return writeStore("draft", store, `cms(draft): save ${safePath}`);
}

/** Make saved work live immediately. The site reads this store at request time. */
export async function publishAdminFile(filePath: string, content: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (!config) {
    const [published, drafts] = await Promise.all([readLocalStore("published"), readLocalStore("draft")]);
    published[safePath] = content;
    drafts[safePath] = content;
    await Promise.all([writeLocalStore("published", published), writeLocalStore("draft", drafts)]);
    return { commit: { sha: "local-published" } };
  }
  const [published, drafts] = await Promise.all([readStore("published"), readStore("draft")]);
  published[safePath] = content;
  drafts[safePath] = content;
  const result = await writeStore("published", published, `cms(publish): ${safePath}`);
  await writeStore("draft", drafts, `cms(draft): sync ${safePath}`);
  return result;
}

export async function readPublishedAdminFile(filePath: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (config) {
    const published = await readStore("published");
    if (published[safePath] !== undefined) return published[safePath];
    return (await readRepoFile(safePath, config.branch)).content;
  }
  return fs.readFile(path.join(process.cwd(), safePath), "utf8");
}

export async function writeAdminFile(filePath: string, content: string, message: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (config) {
    let sha: string | undefined;
    try {
      sha = (await readRepoFile(safePath, config.branch)).sha;
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("404")) throw error;
    }
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${safePath}`;
    return githubRequest<{ commit: { sha: string } }>(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString("base64"),
        branch: config.branch,
        ...(sha ? { sha } : {}),
      }),
    });
  }
  await fs.writeFile(path.join(process.cwd(), safePath), content, "utf8");
  return { commit: { sha: "local" } };
}

export async function deleteAdminFile(filePath: string, message: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (config) {
    const { sha } = await readAdminFile(safePath);
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${safePath}`;
    return githubRequest<{ commit: { sha: string } }>(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sha, branch: config.branch }),
    });
  }
  await fs.unlink(path.join(process.cwd(), safePath));
  return { commit: { sha: "local" } };
}

export async function writeAdminMedia(filePath: string, bytes: Buffer) {
  const safePath = filePath.replaceAll("\\", "/");
  if (!MEDIA_PATH.test(safePath)) throw new Error("Invalid image path or format.");
  if (bytes.byteLength > 5_000_000) throw new Error("Images must be smaller than 5 MB.");
  const config = githubConfig();
  if (config) {
    await ensureContentBranch();
    const filename = safePath.split("/").at(-1)!;
    return writeRepoFile(`.cms/media/${filename}`, config.contentBranch, bytes.toString("base64"), `cms(media): upload ${filename}`);
  }
  const absolutePath = path.join(process.cwd(), ".cms/media", safePath.split("/").at(-1)!);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, bytes);
  return { commit: { sha: "local" } };
}

export async function listAdminMedia(): Promise<AdminMedia[]> {
  const config = githubConfig();
  if (config) {
    await ensureContentBranch();
    const [source, cms] = await Promise.all([
      githubRequest<{ tree: Array<{ path: string; type: string; size?: number }> }>(`https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${encodeURIComponent(config.branch)}?recursive=1`),
      githubRequest<{ tree: Array<{ path: string; type: string; size?: number }> }>(`https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${encodeURIComponent(config.contentBranch)}?recursive=1`),
    ]);
    const existing = source.tree
      .filter((item) => item.type === "blob" && MEDIA_PATH.test(item.path))
      .map((item) => ({ path: item.path, size: item.size || 0, url: item.path.replace(/^public/, "") }))
    const runtime = cms.tree
      .filter((item) => item.type === "blob" && /^\.cms\/media\/[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp|gif)$/.test(item.path))
      .map((item) => {
        const filename = item.path.split("/").at(-1)!;
        return { path: `public/assets/uploads/${filename}`, size: item.size || 0, url: `/api/media/${filename}` };
      });
    return [...runtime, ...existing].sort((a, b) => b.path.localeCompare(a.path));
  }
  const directory = path.join(process.cwd(), ".cms/media");
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const media: AdminMedia[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const filePath = `public/assets/uploads/${entry.name}`;
      if (!MEDIA_PATH.test(filePath)) continue;
      const stat = await fs.stat(path.join(directory, entry.name));
      media.push({ path: filePath, size: stat.size, url: `/api/media/${entry.name}` });
    }
    return media.sort((a, b) => b.path.localeCompare(a.path));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function deleteAdminMedia(filePath: string) {
  const safePath = filePath.replaceAll("\\", "/");
  if (!MEDIA_PATH.test(safePath)) throw new Error("Invalid image path.");
  const config = githubConfig();
  if (config) {
    await ensureContentBranch();
    const filename = safePath.split("/").at(-1)!;
    const repositoryPath = `.cms/media/${filename}`;
    const getUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${repositoryPath}?ref=${encodeURIComponent(config.contentBranch)}`;
    const file = await githubRequest<{ sha: string }>(getUrl);
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${repositoryPath}`;
    return githubRequest<{ commit: { sha: string } }>(url, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `cms(media): delete ${filename}`,
        sha: file.sha,
        branch: config.contentBranch,
      }),
    });
  }
  await fs.unlink(path.join(process.cwd(), ".cms/media", safePath.split("/").at(-1)!));
  return { commit: { sha: "local" } };
}

export async function readRuntimeMedia(filename: string) {
  if (!/^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp|gif)$/.test(filename)) throw new Error("Invalid image name.");
  const config = githubConfig();
  if (config) {
    const file = await readRepoFile(`.cms/media/${filename}`, config.contentBranch);
    return Buffer.from(file.content, "base64");
  }
  return fs.readFile(path.join(process.cwd(), ".cms/media", filename));
}
