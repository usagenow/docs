import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, GitHubIcon } from "@/components/ui/icons";
import { pageMetadata } from "@/lib/metadata";
import { release } from "@/lib/release";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({ description: site.description, path: "/" });

const entryPoints = [
  {
    title: "Install UsageNow",
    href: "/installation",
    text: "Requirements, build availability, and building from source.",
  },
  {
    title: "Configure providers",
    href: "/providers",
    text: "Turn Codex and Claude Code on or off, and see what each one reports.",
  },
  {
    title: "Understand usage limits",
    href: "/menu-bar#usage-windows",
    text: "What “58% left” means, how resets work, and how local activity differs.",
  },
];

const facts = [
  { term: "Platform", value: `${release.minimumMacOS} or later` },
  { term: "Providers", value: "Codex, Claude Code, Gemini CLI, Antigravity, Kiro, Warp, and API accounts" },
  { term: "Surfaces", value: "Menu bar, desktop widget" },
  { term: "License", value: "MIT" },
];

export default function HomePage() {
  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-title">
        <p className="eyebrow">Documentation</p>
        <h1 id="home-title">UsageNow Docs</h1>
        <p className="home-lead">Everything you need to install, configure, and use UsageNow.</p>
        <div className="home-actions">
          <Link href="/getting-started" className="button" data-variant="primary">
            Get started
            <ArrowRightIcon width={15} height={15} />
          </Link>
          <a href={site.links.repository} className="button" data-variant="secondary">
            <GitHubIcon width={15} height={15} />
            View on GitHub
          </a>
        </div>
      </section>

      <section aria-labelledby="start-here">
        <h2 id="start-here" className="sr-only">
          Start here
        </h2>
        <div className="cards">
          {entryPoints.map((entry) => (
            <Link key={entry.href} href={entry.href} className="card">
              <span className="card-title">
                {entry.title}
                <ArrowRightIcon width={14} height={14} />
              </span>
              <span className="card-text">{entry.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-about prose" aria-labelledby="what-is-usagenow">
        <h2 id="what-is-usagenow">What is UsageNow?</h2>
        <p>
          UsageNow is a native macOS menu bar app that keeps Codex and Claude Code usage, limits, reset times, and
          token activity within reach.
        </p>
        <p>
          It shows how much of each usage window is left and when it resets, next to what you’ve used on this Mac
          today. Your usage data stays on your Mac, and the code is open source.{" "}
          <Link href="/introduction">Read the introduction</Link>.
        </p>
        <dl className="facts">
          {facts.map((fact) => (
            <div key={fact.term}>
              <dt>{fact.term}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
