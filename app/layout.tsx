import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/docs/footer";
import { Header } from "@/components/docs/header";
import { SearchDialog } from "@/components/docs/search";
import { SidebarNav } from "@/components/docs/sidebar-nav";
import { themeScript } from "@/components/ui/theme";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  ...pageMetadata({ description: site.description, path: "/" }),
  title: { default: site.title, template: `%s — ${site.title}` },
  applicationName: site.title,
  authors: [{ name: "UsageNow", url: site.links.website }],
  creator: "UsageNow",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#111118" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <Header />
        <div className="shell">
          <div className="sidebar">
            <SidebarNav />
          </div>
          <div className="main-column">
            <main id="content" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </div>
        </div>
        <SearchDialog />
      </body>
    </html>
  );
}
