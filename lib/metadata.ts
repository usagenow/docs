import type { Metadata } from "next";
import { site } from "./site";

export const ogImage = {
  url: "/brand/og.jpg",
  width: 1200,
  height: 630,
  alt: "UsageNow",
};

/** Per-page metadata. Child `openGraph` replaces the parent's, so it's complete here. */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title?: string;
  description: string;
  path: string;
}): Metadata {
  const fullTitle = title ? `${title} — ${site.title}` : site.title;
  return {
    title: title ?? { absolute: site.title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: site.title,
      title: fullTitle,
      description,
      url: path,
      images: [ogImage],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@UsageNow",
      title: fullTitle,
      description,
      images: [ogImage.url],
    },
  };
}
