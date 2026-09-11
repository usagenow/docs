import fs from "node:fs/promises";
import path from "node:path";
import { evaluate } from "@mdx-js/mdx";
import matter from "gray-matter";
import type { MDXContent } from "mdx/types";
import * as runtime from "react/jsx-runtime";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { flatNavigation } from "./navigation";

const CONTENT_DIR = path.join(process.cwd(), "content", "docs");

export type TocEntry = { id: string; title: string; depth: 2 | 3 };

/** A heading and the text under it, for search. The first section is the page intro. */
export type DocSection = { id?: string; heading?: string; text: string };

export type Doc = {
  slug: string;
  /** Path relative to content/docs, for "Edit this page". */
  file: string;
  title: string;
  description: string;
  Content: MDXContent;
  toc: TocEntry[];
  sections: DocSection[];
};

type Frontmatter = { title?: unknown; description?: unknown };

const prettyCode: PrettyCodeOptions = {
  theme: { light: "github-light", dark: "github-dark" },
  keepBackground: false,
  defaultLang: { block: "plaintext" },
};

/** Minimal hast shape; enough to walk the tree without extra type packages. */
type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const BLOCK_TAGS = new Set(["p", "li", "td", "th", "h1", "h2", "h3", "h4", "div", "blockquote", "figure", "tr"]);

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

/**
 * Collects the table of contents and search sections from the final HTML
 * tree, after rehype-slug has assigned ids, so anchors always match.
 */
function rehypeCollect(sink: { toc: TocEntry[]; sections: DocSection[] }) {
  return () => (tree: HastNode) => {
    let current: DocSection = { text: "" };
    sink.sections.push(current);

    const walk = (node: HastNode) => {
      if (node.type === "element" && (node.tagName === "h2" || node.tagName === "h3")) {
        const id = String(node.properties?.id ?? "");
        const title = textOf(node).replace(/\s+/g, " ").trim();
        sink.toc.push({ id, title, depth: node.tagName === "h2" ? 2 : 3 });
        current = { id, heading: title, text: "" };
        sink.sections.push(current);
        return;
      }
      // Code blocks make poor search snippets; commands are also named in prose.
      if (node.type === "element" && node.tagName === "pre") return;
      if (node.type === "text") {
        current.text += node.value ?? "";
        return;
      }
      node.children?.forEach(walk);
      const isBlock =
        (node.type === "element" && BLOCK_TAGS.has(node.tagName ?? "")) || node.type === "mdxJsxFlowElement";
      if (isBlock) current.text += " ";
    };
    walk(tree);

    for (const section of sink.sections) section.text = section.text.replace(/\s+/g, " ").trim();
    sink.sections = sink.sections.filter((section) => section.heading || section.text);
  };
}

async function compile(slug: string): Promise<Doc> {
  const file = `${slug}.mdx`;
  const raw = await fs.readFile(sourcePath(slug), "utf8");
  const { content, data } = matter(raw);
  const frontmatter = data as Frontmatter;
  if (typeof frontmatter.title !== "string" || typeof frontmatter.description !== "string") {
    throw new Error(`${file} needs a string "title" and "description" in its frontmatter.`);
  }

  const sink: { toc: TocEntry[]; sections: DocSection[] } = { toc: [], sections: [] };
  const { default: Content } = await evaluate(content, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug, rehypeCollect(sink), [rehypePrettyCode, prettyCode]],
  });

  return {
    slug,
    file,
    title: frontmatter.title,
    description: frontmatter.description,
    Content,
    toc: sink.toc,
    sections: sink.sections,
  };
}

function sourcePath(slug: string): string {
  return path.join(CONTENT_DIR, `${slug}.mdx`);
}

// Pages, metadata, and the search index all ask for the same documents
// during a build; compile each one once. Entries are keyed by the file's
// modification time so `next dev` recompiles a page after it's edited.
const compiled = new Map<string, { mtimeMs: number; doc: Promise<Doc> }>();

export async function getDoc(slug: string): Promise<Doc> {
  const { mtimeMs } = await fs.stat(sourcePath(slug));
  const cached = compiled.get(slug);
  if (cached && cached.mtimeMs === mtimeMs) return cached.doc;
  const doc = compile(slug);
  compiled.set(slug, { mtimeMs, doc });
  return doc;
}

export function getAllDocs(): Promise<Doc[]> {
  return Promise.all(flatNavigation.map((item) => getDoc(item.slug)));
}

export function isDocSlug(slug: string): boolean {
  return flatNavigation.some((item) => item.slug === slug);
}
