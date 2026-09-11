/** Public facts about UsageNow used across the docs. */
export const site = {
  name: "UsageNow",
  title: "UsageNow Docs",
  url: "https://docs.usagenow.com",
  tagline: "See what’s left. Keep building.",
  description:
    "Documentation for UsageNow, the open-source macOS menu bar app for monitoring AI coding usage, limits, resets, and token activity.",
  links: {
    website: "https://usagenow.com",
    githubOrg: "https://github.com/usagenow",
    repository: "https://github.com/usagenow/usagenow",
    x: "https://x.com/UsageNow",
    readme: "https://github.com/usagenow/usagenow#readme",
    security: "https://github.com/usagenow/usagenow/blob/main/SECURITY.md",
    contributing: "https://github.com/usagenow/usagenow/blob/main/CONTRIBUTING.md",
    license: "https://github.com/usagenow/usagenow/blob/main/LICENSE",
    issues: "https://github.com/usagenow/usagenow/issues",
    newIssue: "https://github.com/usagenow/usagenow/issues/new",
    securityAdvisory: "https://github.com/usagenow/usagenow/security/advisories/new",
  },
  /** Where this documentation's MDX sources live, for "Edit this page". */
  docsRepository: {
    url: "https://github.com/usagenow/docs",
    branch: "main",
    contentPath: "content/docs",
  },
} as const;

export function editUrl(file: string): string {
  const { url, branch, contentPath } = site.docsRepository;
  return `${url}/edit/${branch}/${contentPath}/${file}`;
}
