/**
 * The documentation's information architecture. Sidebar, previous/next
 * links, the sitemap, and static generation all derive from this list, so
 * adding a page means adding its MDX file and one entry here.
 */
export type NavItem = {
  /** Sidebar label. The page's own title comes from its frontmatter. */
  title: string;
  /** URL path without a leading slash; also the MDX path under content/docs. */
  slug: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", slug: "introduction" },
      { title: "Installation", slug: "installation" },
      { title: "Getting Started", slug: "getting-started" },
    ],
  },
  {
    title: "Usage",
    items: [
      { title: "Menu Bar", slug: "menu-bar" },
      { title: "Widgets", slug: "widgets" },
      { title: "Settings", slug: "settings" },
    ],
  },
  {
    title: "Providers",
    items: [
      { title: "Overview", slug: "providers" },
      { title: "Codex", slug: "providers/codex" },
      { title: "Claude Code", slug: "providers/claude-code" },
      { title: "Coming Soon", slug: "providers/coming-soon" },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { title: "Privacy", slug: "privacy" },
      { title: "Telemetry", slug: "telemetry" },
      { title: "Security", slug: "security" },
    ],
  },
  {
    title: "Help",
    items: [
      { title: "Troubleshooting", slug: "troubleshooting" },
      { title: "FAQ", slug: "faq" },
    ],
  },
  {
    title: "Open Source",
    items: [
      { title: "Open Source", slug: "open-source" },
      { title: "Contributing", slug: "contributing" },
      { title: "License & Brand", slug: "license" },
    ],
  },
];

export const flatNavigation: NavItem[] = navigation.flatMap((group) => group.items);

export function hrefFor(slug: string): string {
  return slug ? `/${slug}` : "/";
}

export function findNeighbours(slug: string): { previous?: NavItem; next?: NavItem } {
  const index = flatNavigation.findIndex((item) => item.slug === slug);
  if (index === -1) return {};
  return { previous: flatNavigation[index - 1], next: flatNavigation[index + 1] };
}

export function groupFor(slug: string): NavGroup | undefined {
  return navigation.find((group) => group.items.some((item) => item.slug === slug));
}
