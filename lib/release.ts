/**
 * Distribution status, in one place.
 *
 * Installation copy across the docs reads from here. When a signed build
 * ships, flip the matching flag and fill in its details — pages update
 * without rewriting prose. Never mark something available before it is.
 */
export const release = {
  /** Download from usagenow.com. */
  websiteDownload: { available: true, url: "https://usagenow.com/download/usagenow.dmg" },
  /** GitHub Releases. */
  githubReleases: { available: true, url: "https://github.com/usagenow/usagenow/releases" },
  /** Homebrew Cask. `command` is shown only once the cask exists. */
  homebrew: { available: false, command: "brew install --cask usagenow" },
  /** Minimum macOS version, from the Xcode project's deployment target. */
  minimumMacOS: "macOS 15",
  /** Minimum Xcode version to build from source. */
  minimumXcode: "Xcode 26",
} as const;

export type DistributionChannel = {
  id: "website" | "github" | "homebrew";
  name: string;
  available: boolean;
};

export const distributionChannels: DistributionChannel[] = [
  { id: "website", name: "Download from usagenow.com", available: release.websiteDownload.available },
  { id: "github", name: "GitHub Releases", available: release.githubReleases.available },
  { id: "homebrew", name: "Homebrew Cask", available: release.homebrew.available },
];
