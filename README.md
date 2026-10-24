# UsageNow Docs

Official documentation for [UsageNow](https://usagenow.com), the open-source macOS menu bar app for monitoring AI coding usage, limits, resets, and token activity.

Website: [docs.usagenow.com](https://docs.usagenow.com)

## Development

Uses Next.js 16.4.3 and React 19.3.1. Requires Node.js 20.9 or later; Node.js 24 LTS is recommended for deployment.

```sh
npm ci             # install the locked dependency versions
npm run dev        # start the dev server at http://localhost:3000
npm run build      # build the static site into out/
npm start          # serve out/ locally at http://localhost:3000
```

Before opening a pull request, run every check — TypeScript, lint, production build, internal links, and the static server:

```sh
npm run check
```

The local server binds to `127.0.0.1` by default. Set `PORT` to change the port or `HOST` to change the bind address, for example `PORT=3058 npm start`. An explicit port passed to `node scripts/serve.mjs <port>` takes priority. Server checks cover malformed URLs, missing pages, path boundaries, caching, and HEAD requests.

## Writing docs

- Pages are MDX files in `content/docs/`. Each needs a `title` and `description` in its frontmatter.
- `lib/docs/navigation.ts` defines the sidebar order. Previous/next links, the sitemap, and static routes are generated from it, so a new page needs its file and one entry there.
- Headings (`##`, `###`) build the “On this page” list and the search index automatically.
- Components available in MDX: `Callout` (`info`, `note`, `experimental`, `privacy`, `warning`), `Steps`, `Cards`/`Card`, `Badge`, `Kbd`, `Screenshot`, `DistributionChannels`, and `Requirements`.
- Screenshots of the app live in `public/screenshots/` and are registered in `components/docs/screenshot.tsx` with their alt text.
- Document only behavior the app actually has. Planned features are labeled “planned” or “coming soon.”

## Release status

Installation wording reads from `lib/release.ts`. When a signed build, GitHub Releases, or the Homebrew cask becomes available, flip its flag there — don’t hard-code availability in page copy.

## Deployment

`npm run build` produces a fully static site in `out/` (Next.js static export). Deploy that folder to any static host that serves `page.html` for `/page`, such as Vercel, Netlify, or Cloudflare Pages. The site has no backend, no analytics, and no cookies.

## License

The documentation code is licensed under the MIT License. The UsageNow name, logo, icon, and other brand assets are not covered by the MIT License.
