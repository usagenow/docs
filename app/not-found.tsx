import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="home">
      <section className="home-hero">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="home-lead">This page doesn’t exist or has moved. Try searching, or start from the docs home.</p>
        <div className="home-actions">
          <Link href="/" className="button" data-variant="primary">
            Docs home
          </Link>
          <Link href="/troubleshooting" className="button" data-variant="secondary">
            Troubleshooting
          </Link>
        </div>
      </section>
    </div>
  );
}
