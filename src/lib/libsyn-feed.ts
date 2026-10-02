import { load } from "cheerio";
import { XMLParser } from "fast-xml-parser";

export const LIBSYN_RSS_URL = "https://feeds.libsyn.com/445245/rss";

export type LibsynEpisode = {
  audioUrl: string;
  date: string;
  description: string;
  duration?: string;
  episodeNumber?: string;
  guid: string;
  image?: string;
  link: string;
  slug: string;
  title: string;
};

export type LibsynFeed = {
  author: string;
  description: string;
  episodes: LibsynEpisode[];
  image: string;
  lastBuildDate?: string;
  title: string;
};

type XmlRecord = Record<string, unknown>;

function record(value: unknown): XmlRecord {
  return value && typeof value === "object" ? (value as XmlRecord) : {};
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  const node = record(value);
  return text(node["#text"] ?? node.__cdata ?? node["#cdata-section"] ?? "");
}

function plainText(value: unknown): string {
  const html = text(value);
  if (!html) return "";
  return load(html).text().replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 110);
}

function slugFromLink(link: string, title: string): string {
  try {
    const segment = new URL(link).pathname.split("/").filter(Boolean).pop();
    return segment ? slugify(segment) : slugify(title);
  } catch {
    return slugify(title);
  }
}

function imageHref(value: unknown): string {
  const node = record(value);
  return text(node["@_href"] ?? node.href ?? value);
}

export async function getLibsynFeed(): Promise<LibsynFeed | null> {
  try {
    const response = await fetch(LIBSYN_RSS_URL, {
      headers: { Accept: "application/rss+xml, application/xml;q=0.9, text/xml;q=0.8" },
      next: { revalidate: 900 },
    });
    if (!response.ok) throw new Error(`Libsyn returned ${response.status}`);

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseTagValue: false,
      trimValues: true,
    });
    const parsed = parser.parse(await response.text());
    const channel = record(record(parsed).rss).channel as XmlRecord | undefined;
    if (!channel) throw new Error("Libsyn RSS channel is missing");

    const rawItems = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : [];
    const channelImage = imageHref(channel["itunes:image"]) || text(record(channel.image).url);

    const episodes = rawItems
      .map((rawItem): LibsynEpisode | null => {
        const item = record(rawItem);
        const title = text(item["itunes:title"] ?? item.title);
        const link = text(item.link);
        const audioUrl = text(record(item.enclosure)["@_url"]);
        const pubDate = text(item.pubDate);
        if (!title || !audioUrl || !pubDate) return null;

        const description = plainText(item["content:encoded"] ?? item.description);
        const guid = text(item.guid) || link || `${title}-${pubDate}`;
        return {
          audioUrl,
          date: new Date(pubDate).toISOString(),
          description,
          duration: text(item["itunes:duration"]) || undefined,
          episodeNumber: text(item["itunes:episode"]) || undefined,
          guid,
          image: imageHref(item["itunes:image"]) || channelImage || undefined,
          link,
          slug: slugFromLink(link, title),
          title,
        };
      })
      .filter((episode): episode is LibsynEpisode => Boolean(episode))
      .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

    return {
      author: text(channel["itunes:author"]),
      description: plainText(channel["itunes:summary"] ?? channel.description),
      episodes,
      image: channelImage,
      lastBuildDate: text(channel.lastBuildDate) || undefined,
      title: text(channel.title),
    };
  } catch (error) {
    console.error("Unable to refresh the Libsyn podcast feed:", error);
    return null;
  }
}
