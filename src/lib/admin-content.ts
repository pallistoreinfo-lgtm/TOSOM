import fs from "node:fs/promises";
import path from "node:path";

const CONTENT_PATH = /^(?:content\/home\.json|content\/(pages|blog|podcast|conditions|labtests)\/[a-z0-9][a-z0-9-]*\.mdx)$/;
const MEDIA_PATH = /^public\/assets\/uploads\/[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g|webp|gif)$/;
const COLLECTION_ROOTS = [
  "content/pages/",
  "content/blog/",
  "content/podcast/",
  "content/conditions/",
  "content/labtests/",
];

export type AdminFile = { path: string; size: number };

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
  };
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

export async function listAdminFiles(): Promise<AdminFile[]> {
  const config = githubConfig();
  if (config) {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/git/trees/${encodeURIComponent(config.branch)}?recursive=1`;
    const result = await githubRequest<{ tree: Array<{ path: string; type: string; size?: number }> }>(url);
    return result.tree
      .filter((item) => item.type === "blob" && CONTENT_PATH.test(item.path))
      .map((item) => ({ path: item.path, size: item.size || 0 }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }

  const files: AdminFile[] = [];
  const homeStat = await fs.stat(path.join(process.cwd(), "content/home.json"));
  files.push({ path: "content/home.json", size: homeStat.size });
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
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function readAdminFile(filePath: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (config) {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${safePath}?ref=${encodeURIComponent(config.branch)}`;
    const result = await githubRequest<{ content: string; sha: string }>(url);
    return {
      content: Buffer.from(result.content.replaceAll("\n", ""), "base64").toString("utf8"),
      sha: result.sha,
    };
  }
  return {
    content: await fs.readFile(path.join(process.cwd(), safePath), "utf8"),
    sha: "local",
  };
}

export async function writeAdminFile(filePath: string, content: string, message: string) {
  const safePath = validateContentPath(filePath);
  const config = githubConfig();
  if (config) {
    let sha: string | undefined;
    try {
      sha = (await readAdminFile(safePath)).sha;
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
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${safePath}`;
    return githubRequest<{ commit: { sha: string } }>(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `media(admin): upload ${safePath.split("/").at(-1)}`,
        content: bytes.toString("base64"),
        branch: config.branch,
      }),
    });
  }
  const absolutePath = path.join(process.cwd(), safePath);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, bytes);
  return { commit: { sha: "local" } };
}
