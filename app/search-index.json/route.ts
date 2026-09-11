import { getAllDocs } from "@/lib/docs/content";
import { groupFor, hrefFor } from "@/lib/docs/navigation";
import type { SearchRecord } from "@/lib/docs/search";

// Generated once at build time and served as a static file.
export const dynamic = "force-static";

export async function GET() {
  const docs = await getAllDocs();
  const records: SearchRecord[] = docs.flatMap((doc) => {
    const url = hrefFor(doc.slug);
    const group = groupFor(doc.slug)?.title ?? "Docs";
    return doc.sections.map((section, index) => ({
      url: section.id ? `${url}#${section.id}` : url,
      page: doc.title,
      group,
      heading: section.heading,
      // The intro stands for the whole page, so it includes the description.
      text: index === 0 && !section.heading ? `${doc.description} ${section.text}`.trim() : section.text,
    }));
  });
  return Response.json(records);
}
