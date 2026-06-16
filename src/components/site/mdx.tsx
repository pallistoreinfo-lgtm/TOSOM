import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CalendlyEmbed, GutQuiz, YouTube } from "./embeds";
import { cn } from "@/lib/utils";

// Components available inside MDX bodies (migrated articles reference these).
const mdxComponents = {
  CalendlyEmbed,
  GutQuiz,
  YouTube,
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const src = props.src ?? "";
    // Local migrated images live under /assets/...; serve via next/image (unoptimized in export).
    return (
      <Image
        src={typeof src === "string" ? src : ""}
        alt={props.alt ?? ""}
        width={900}
        height={600}
        className="my-6 h-auto w-full rounded-md"
      />
    );
  },
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const href = props.href ?? "";
    const external = /^https?:\/\//.test(href) && !href.includes("theothersideofmedicine.com");
    return <a {...props} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} />;
  },
};

/** Renders an MDX body inside a typographic prose container. */
export function Prose({ source, className }: { source: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose-tosm max-w-none",
        "[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-secondary",
        "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-secondary",
        "[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-foreground/90",
        "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mt-1",
        "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-dark",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic",
        className,
      )}
    >
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}
