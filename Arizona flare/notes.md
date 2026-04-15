# M. Ortigão — Site Notes

## Done

### Performance & code refactor (JS/CSS)
- **Image flash fix**: removed `loading="lazy"` and `decoding="async"` from dynamically created images — these were fighting the preload cache, causing flicker on frame navigation. Images now start at `opacity: 0` and fade in over 200ms on load via CSS transition.
- **Image cache retained**: `warmImageCache()` now stores preloaded `Image` objects in a persistent `imageCache` array, preventing garbage collection from evicting them.
- **Contact accordion refactor**: replaced `max-height: 0 → 2000px` hack with `grid-template-rows: 0fr → 1fr` — animates to actual content height with proper easing. Added `.contact-section-inner` wrappers in HTML.
- **DOM recycling**: added `gridRecycler` IntersectionObserver — grids that scroll 3× viewport heights off-screen have their children removed (height preserved via `minHeight`), and are rebuilt when scrolled back into range. Prevents unbounded DOM growth.
- **Video lazy loading**: videos now start with `preload="none"` instead of `preload="metadata"`. A dual-threshold observer (`rootMargin: 50%`) starts preloading metadata when near viewport and plays at 15% visibility.
- **`will-change` optimization**: removed permanent `will-change: clip-path` from contact overlay CSS. Now toggled via JS — set on open, cleared after close transition ends.
- **First grid recycling**: `#mosaic` (first grid) is now observed by the recycler, same as appended grids.
- **Font loading**: added `font-display: block` to both `@font-face` declarations — text stays hidden until real fonts load (no swap flash). Added WOFF2 `src` references with OTF fallback (WOFF2 files still need to be generated — see task below).

### Structure
- Renamed `scroll_NEW_contact.html` → `index.html`
- Hidden H1 added (`Miguel Ortigão — Arquitectura`) for SEO — visually invisible
- `robots.txt` created (allow all, sitemap reference)
- `sitemap.xml` created (single URL, DOMAIN placeholder)
- Extracted CSS → `style.css`
- Extracted JS → `main.js`
- All media organized into `assets/` subfolders by project:
  - `assets/banco/`, `assets/fairly/`, `assets/mustique/`, `assets/paez/`, `assets/peca/`, `assets/lapa-lofts/`
- All filenames normalized to lowercase
- PEÇA unicode inconsistency fixed (→ `peca/`)
- Removed missing `ClashDisplay-Medium.ttf` font reference

### Media
- All 13 `.mov` files converted to H.264 MP4 (web-compatible, Firefox-safe)
- Original `.mov` files deleted

### Meta & SEO
- `lang="pt"`, charset, viewport — already present
- Title updated: `Miguel Ortigão — Arquitectura`
- Meta description added (137 chars)
- Canonical link added (placeholder domain — see below)
- Open Graph tags added: `og:type`, `og:title`, `og:description`, `og:url`, `og:image`
- OG image created: `og-image.jpg` (1200×630, cropped from `fairly1.jpg`)
- Favicon added: `favicon.svg` (MO monogram, matches site palette)

### Dev setup
- `package.json` with `npm start` → runs `npx serve .` (works for any agent/editor)
- `.claude/launch.json` → Launch preview panel in Claude app

---

## Still to decide / to do

### Domain
- **Final URL not set yet.** Two places need updating before deploy:
  ```html
  <link rel="canonical" href="https://DOMAIN/" />
  <meta property="og:url"   content="https://DOMAIN/" />
  <meta property="og:image" content="https://DOMAIN/og-image.jpg" />
  ```
  Replace `DOMAIN` with the actual domain (e.g. `miguelortigao.com`).

### OG image
- Currently cropped from `assets/fairly/fairly1.jpg` — confirm this is the right image
- Should ideally be a curated, horizontal shot that represents the practice well
- Verify at [opengraph.xyz](https://www.opengraph.xyz) once the site is live
- Test preview with opengraph.xyz — see how it looks when the link is shared on LinkedIn, WhatsApp, etc.
- **Confirm with client**: Check if Miguel is happy with the current OG image. If not, we need to replace it

### Hosting / deploy
- Platform not chosen yet — Cloudflare Pages recommended (free, fast CDN, git-based deploy)
- Abordagem 1 (plain HTML + manual optimization) is the right fit for this site
- See `abordagens-deploy.md` for full comparison

### Image optimization (optional but recommended)
- Current images are uncompressed JPGs — converting to WebP would reduce load times
- Can be done with ffmpeg or Squoosh before deploy
- Note: `@squoosh/cli` is deprecated, use `sharp` or `ffmpeg` instead

### rel="me" + Schema sameAs — waiting on Miguel's social URLs
- Need LinkedIn (and Instagram if applicable) URLs from Miguel
- Once received, add to `index.html` in two places:
  1. `<head>`: `<link rel="me" href="https://linkedin.com/in/PROFILE" />`
  2. Schema JSON-LD `sameAs` array (currently empty):
     ```json
     "sameAs": ["https://linkedin.com/in/PROFILE"]
     ```
- Also submit sitemap in Google Search Console once domain is live

### ~~Favicon — apple-touch-icon~~ ✅
- `apple-touch-icon.png`, `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `site.webmanifest` — all present
- **Confirm with client**: Check if Miguel is happy with the current favicon icons. If not, we need to replace them

### Font files — convert OTF to WOFF2
- `assets/fonts/PPNeueMontreal-Book.otf` (113 KB) and `assets/fonts/ABCWalterNeue-Regular-Trial.otf` (91 KB) should be converted to WOFF2
- WOFF2 is typically 30-50% smaller than OTF — significant for initial load
- CSS already references `.woff2` files with OTF fallback — just need to generate them
- Use an online converter or `fonttools` (`pip install fonttools brotli`, then `pyftsubset font.otf --output-file=font.woff2 --flavor=woff2`)

### Performance — PageSpeed Insights (essencial, post-deploy)
- Test at pagespeed.web.dev once site is live
- Target: score above 90 on mobile
- `width`/`height` on `<img>` tags not feasible — images are JS-generated at runtime, dimensions unknown at write time

### Deploy — two manual steps remaining

**1. Create GitHub repo and push**
```bash
# On github.com: create a new empty repo (e.g. "mortigao")
# Then run locally:
git remote add origin https://github.com/YOUR_USERNAME/mortigao.git
git push -u origin master
```

**2. Connect to Cloudflare Pages**
- Go to Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
- Select the GitHub repo
- Build settings: leave blank (no build command, no output directory — it's plain HTML)
- Deploy — Cloudflare assigns a `.pages.dev` URL immediately
- Add custom domain once DNS is ready

After both steps, replace `DOMAIN` in `index.html`, `robots.txt`, and `sitemap.xml`.

### Google Search Console + HTTPS (post-deploy)
- Submit sitemap at search.google.com/search-console
- Verify domain ownership
- HTTPS → HTTP redirect handled automatically by Cloudflare

### Mobile layout review
- The 3-column staggered grid has not been reviewed on real mobile devices
- Worth checking on iPhone (Safari) and Android (Chrome) before going live
