import { distributionChannels, release } from "@/lib/release";

/** Distribution channels, marked by what actually exists today. Reads `lib/release.ts`. */
export function DistributionChannels() {
  return (
    <ul className="channel-list">
      {distributionChannels.map((channel) => (
        <li key={channel.id}>
          <span>{channel.name}</span>
          <span className="badge" data-variant={channel.available ? "available" : "planned"}>
            {channel.available ? "Available" : "Planned"}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Requirements() {
  return (
    <ul>
      <li>{release.minimumMacOS} or later</li>
      <li>A Mac with Codex, Claude Code, or both installed and signed in</li>
    </ul>
  );
}
