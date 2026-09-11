import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Callout } from "./callout";
import { Pre } from "./code-block";
import { DistributionChannels, Requirements } from "./release-status";
import { Screenshot } from "./screenshot";

function Anchor({ href = "", children, ...props }: ComponentProps<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} rel="noopener" data-external="" {...props}>
      {children}
    </a>
  );
}

function heading(Tag: "h2" | "h3") {
  return function Heading({ id, children, ...props }: ComponentProps<"h2">) {
    return (
      <Tag id={id} {...props}>
        {children}
        {id && (
          <a href={`#${id}`} className="heading-anchor" aria-label="Link to this section">
            #
          </a>
        )}
      </Tag>
    );
  };
}

function Table(props: ComponentProps<"table">) {
  return (
    // Focusable so keyboard users can scroll wide tables on small screens.
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Table">
      <table {...props} />
    </div>
  );
}

/** Numbered steps: each `###` heading inside becomes a step. */
function Steps({ children }: { children: ReactNode }) {
  return <div className="steps">{children}</div>;
}

function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="kbd">{children}</kbd>;
}

type BadgeVariant = "available" | "planned" | "experimental" | "neutral";

function Badge({ variant = "neutral", children }: { variant?: BadgeVariant; children: ReactNode }) {
  return (
    <span className="badge" data-variant={variant}>
      {children}
    </span>
  );
}

function Cards({ children }: { children: ReactNode }) {
  return <div className="cards">{children}</div>;
}

function Card({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return (
    <Link href={href} className="card">
      <span className="card-title">
        {title}
        <ArrowRightIcon width={14} height={14} />
      </span>
      <span className="card-text">{children}</span>
    </Link>
  );
}

/** A labelled path through the macOS UI, e.g. Settings › Providers. */
function Path({ children }: { children: ReactNode }) {
  return <span className="ui-path">{children}</span>;
}

export const mdxComponents: MDXComponents = {
  a: Anchor,
  h2: heading("h2"),
  h3: heading("h3"),
  pre: Pre,
  table: Table,
  Callout,
  Steps,
  Kbd,
  Badge,
  Cards,
  Card,
  Path,
  DistributionChannels,
  Requirements,
  Screenshot,
};
