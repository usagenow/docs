import Link from "next/link";
import { Symbol } from "@/components/ui/logo";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <a href={site.links.website} className="footer-brand">
          <Symbol className="footer-symbol" />
          <span>UsageNow</span>
        </a>
        <nav aria-label="Footer">
          <ul className="footer-links">
            <li>
              <a href={site.links.repository}>GitHub</a>
            </li>
            <li>
              <a href={site.links.x}>X</a>
            </li>
            <li>
              <Link href="/license">MIT License</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
