import type { MetadataRoute } from "next";
import { flatNavigation, hrefFor } from "@/lib/docs/navigation";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "weekly", priority: 1 },
    ...flatNavigation.map((item) => ({
      url: `${site.url}${hrefFor(item.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
