"use client";

import { useRef, useState, type ComponentProps } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";

/** A highlighted code block with a copy button. */
export function Pre(props: ComponentProps<"pre">) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = preRef.current?.innerText.replace(/\n$/, "") ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused; the code stays selectable.
    }
  }

  return (
    <div className="code-block">
      {/* Focusable so keyboard users can scroll long lines. */}
      <pre ref={preRef} tabIndex={0} {...props} />
      <button type="button" className="copy-button" onClick={copy} aria-label={copied ? "Copied" : "Copy code"}>
        {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}
