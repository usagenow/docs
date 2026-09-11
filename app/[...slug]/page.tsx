import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/docs/mdx-components";
import { Toc, TocList } from "@/components/docs/toc";
import { ArrowLeftIcon, ArrowRightIcon, PencilIcon } from "@/components/ui/icons";
import { getDoc, isDocSlug } from "@/lib/docs/content";
import { findNeighbours, flatNavigation, groupFor, hrefFor } from "@/lib/docs/navigation";
import { pageMetadata } from "@/lib/metadata";
import { editUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string[] }> };

/** Pages with fewer headings than this don't get "On this page". */
const MIN_TOC_ENTRIES = 3;

export const dynamicParams = false;

export function generateStaticParams() {
  return flatNavigation.map((item) => ({ slug: item.slug.split("/") }));
}

async function resolve(params: Props["params"]) {
  const slug = (await params).slug.join("/");
  if (!isDocSlug(slug)) notFound();
  return getDoc(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await resolve(params);
  return pageMetadata({ title: doc.title, description: doc.description, path: hrefFor(doc.slug) });
}

export default async function DocPage({ params }: Props) {
  const doc = await resolve(params);
  const { Content } = doc;
  const group = groupFor(doc.slug);
  const { previous, next } = findNeighbours(doc.slug);
  const showToc = doc.toc.length >= MIN_TOC_ENTRIES;

  return (
    <div className="doc" data-toc={showToc || undefined}>
      <article className="doc-article">
        <header className="doc-header">
          {group && <p className="eyebrow">{group.title}</p>}
          <h1>{doc.title}</h1>
          <p className="doc-lead">{doc.description}</p>
        </header>

        {showToc && (
          <details className="toc-mobile">
            <summary>On this page</summary>
            <TocList entries={doc.toc} />
          </details>
        )}

        <div className="prose">
          <Content components={mdxComponents} />
        </div>

        <footer className="doc-footer">
          <a href={editUrl(doc.file)} className="edit-link">
            <PencilIcon width={14} height={14} />
            Edit this page on GitHub
          </a>
          {(previous || next) && (
            <nav aria-label="Previous and next pages" className="pager">
              {previous ? (
                <Link href={hrefFor(previous.slug)} className="pager-link" rel="prev">
                  <span className="pager-label">
                    <ArrowLeftIcon width={13} height={13} /> Previous
                  </span>
                  <span className="pager-title">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={hrefFor(next.slug)} className="pager-link pager-next" rel="next">
                  <span className="pager-label">
                    Next <ArrowRightIcon width={13} height={13} />
                  </span>
                  <span className="pager-title">{next.title}</span>
                </Link>
              )}
            </nav>
          )}
        </footer>
      </article>

      {showToc && (
        <div className="doc-toc">
          <Toc entries={doc.toc} />
        </div>
      )}
    </div>
  );
}
