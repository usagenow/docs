import Image from "next/image";

type ScreenshotName = "popover";

/** Real captures of the app. Files are @2x; `width`/`height` are the display size in points. */
const screenshots: Record<ScreenshotName, { src: string; width: number; height: number; alt: string }> = {
  popover: {
    src: "/screenshots/popover.png",
    width: 396,
    height: 398,
    alt: "The UsageNow popover. Codex, on the Plus plan, has one weekly window with 58% left, resetting Tuesday at 20:53. Claude Code, on the Pro plan with Claude Opus 5 as the most recent model, has a 5-hour window with 63% left, resetting in 4 hours, and a weekly window with 61% left, resetting Saturday at 23:00, plus 95.2M tokens and 214 requests today. The footer says Updated just now.",
  },
};

export function Screenshot({ name, caption }: { name: ScreenshotName; caption?: string }) {
  const { src, width, height, alt } = screenshots[name];
  return (
    <figure className="screenshot">
      <Image src={src} width={width} height={height} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
