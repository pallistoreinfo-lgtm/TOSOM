import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/content";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Functional medicine articles from Dr. James Krystosik on gut health, weight loss after 40, SIBO, autoimmune disease, and root-cause healing.",
  alternates: { canonical: "https://theothersideofmedicine.com/articles/" },
};

export default function ArticlesPage() {
  const posts = getBlogPosts();
  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-4xl font-bold text-secondary">Articles</h1>
      <p className="mt-3 text-muted-foreground">
        Root-cause health insights from {posts.length > 0 ? "Dr. James Krystosik" : "the clinic"}.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/${post.slug}/`} className="group">
            <Card className="h-full overflow-hidden transition group-hover:shadow-md">
              {post.frontmatter.heroImage && (
                <div className="relative aspect-[16/9] w-full bg-surface">
                  <Image
                    src={post.frontmatter.heroImage.src}
                    alt={post.frontmatter.heroImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                </div>
              )}
              <CardContent className="pt-5">
                {post.frontmatter.category && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {post.frontmatter.category}
                  </p>
                )}
                <h2 className="mt-1 text-lg font-semibold leading-snug text-secondary group-hover:text-primary">
                  {post.frontmatter.title}
                </h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.frontmatter.excerpt}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
