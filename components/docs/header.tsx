import Link from "next/link";
import { GitHubIcon, XIcon } from "@/components/ui/icons";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme";
import { site } from "@/lib/site";
import { MobileNav } from "./mobile-nav";
import { SearchTrigger } from "./search";
import { SidebarNav } from "./sidebar-nav";

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <MobileNav>
          <SidebarNav />
          <div className="drawer-footer">
            <ul className="drawer-links">
              <li>
                <a href={site.links.website}>UsageNow</a>
              </li>
              <li>
                <a href={site.links.repository}>GitHub</a>
              </li>
              <li>
                <a href={site.links.x}>X</a>
              </li>
            </ul>
            <ThemeToggle showLabels />
          </div>
        </MobileNav>

        <a href={site.links.website} className="brand" aria-label="UsageNow website">
          <Logo className="brand-logo" title="UsageNow" />
        </a>
        <span className="brand-divider" aria-hidden="true" />
        <Link href="/" className="brand-docs">
          Docs
        </Link>

        <div className="header-spacer" />

        <div className="header-search">
          <SearchTrigger />
        </div>
        <nav aria-label="UsageNow links" className="header-links">
          <a href={site.links.repository} className="icon-button" aria-label="UsageNow on GitHub">
            <GitHubIcon width={17} height={17} />
          </a>
          <a href={site.links.x} className="icon-button" aria-label="UsageNow on X">
            <XIcon width={15} height={15} />
          </a>
        </nav>
        <div className="header-theme">
          <ThemeToggle />
        </div>
        <div className="header-search-compact">
          <SearchTrigger compact />
        </div>
      </div>
    </header>
  );
}
