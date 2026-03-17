# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-18
**Commit:** 3f14703
**Branch:** dev

## OVERVIEW

Personal CV/portfolio site — Angular 18 standalone components, TypeScript 5.5, SCSS, custom WebGL gradient background, markdown blog. Live at reshetnik.vercel.app.

## STRUCTURE

```
src/
├── app/
│   ├── config/              # WebGL theme config (single source of truth for colors/animation)
│   ├── pages/
│   │   ├── home/            # Section-based: about-me, education, experience, skills
│   │   ├── blog/            # Markdown blog with own BlogDataService, YAML front matter parser
│   │   └── portfolio/       # Placeholder only — header link exists, page not implemented
│   ├── services/            # Root-provided services (WebGL, reflections, SEO, CV download, home data)
│   └── shared/              # Reusable: header, footer, sidebar, WebGL background, intro overlay, pipes
├── assets/
│   ├── data/
│   │   ├── home-data.json   # ALL resume content — edit this to change site data
│   │   └── blog/            # Blog posts as .md with YAML front matter + index.md registry
│   ├── styles/              # Global SCSS: variables, mixins, breakpoints, typography (has own README)
│   └── fonts/               # Self-hosted Inter + JetBrains Mono variable fonts
├── environments/            # environment.ts / environment.prod.ts
└── main.ts                  # Bootstrap + viewport height fix + Vercel analytics (lazy)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Change resume content | `src/assets/data/home-data.json` | Single JSON drives all sections |
| Add blog post | `src/assets/data/blog/posts/` + register in `blog/index.md` | Markdown + YAML front matter |
| Modify color themes | `src/app/config/webgl.config.ts` | `colorSchemes[]` array — 4 RGB colors per theme |
| Add/edit routes | `src/app/app.routes.ts` | 3 routes: home, blog, blog/:slug |
| Responsive breakpoints | `src/assets/styles/variables/_media.scss` | Desktop-first, 7 breakpoints (375–1920px) + ultrawide |
| SCSS mixins | `src/assets/styles/variables/_mixins.scss` | `respond-*`, `glass-panel`, `interactive-glow`, `rem()` |
| CSS variables | `src/assets/styles/variables/_vars.scss` | Colors, spacing, radii, fonts, reflection RGB |
| Header feature flags | `home-data.json` → `header` | `isBlogDone`, `isDownloadCVDone` |
| SEO meta tags | `src/app/services/seo.service.ts` | Per-route OG + Twitter cards |
| WebGL gradient logic | `src/app/services/webgl-gradient.service.ts` | 1180 lines — Stripe-based shader, parallax, CSS fallback |
| Dynamic reflections | `src/app/services/dynamic-reflection.service.ts` | Reads WebGL colors → sets CSS vars for glass effects |
| CV download | `src/app/services/cv-download.service.ts` | GitHub Actions artifact via nightly.link + iframe trick |

## CODE MAP

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `AppComponent` | Component | `app.component.ts` | Root — route animations, SEO, scroll-to-top |
| `WebGLGradientService` | Service | `services/webgl-gradient.service.ts` | WebGL shader lifecycle, theme management, CSS fallback |
| `GradientInstance` | Class | `services/webgl-gradient.service.ts:341` | Private — canvas, shaders, animation loop, parallax |
| `DynamicReflectionService` | Service | `services/dynamic-reflection.service.ts` | WebGL colors → CSS `--reflection-*` vars |
| `HomeDataService` | Service | `services/home-data.service.ts` | Fetches/caches `home-data.json`, typed accessors |
| `BlogDataService` | Service | `pages/blog/services/blog-data.service.ts` | Parses `index.md` → loads posts → YAML front matter |
| `SeoService` | Service | `services/seo.service.ts` | Sets `<title>`, OG, Twitter, canonical |
| `CvDownloadService` | Service | `services/cv-download.service.ts` | GitHub API → nightly.link artifact download |
| `webglConfig` | Config | `config/webgl.config.ts` | Single source of truth: themes, animation, perf, reflections |

## CONVENTIONS

**Angular patterns (non-obvious):**
- ALL components are **standalone** (`standalone: true`). Schematic generates `standalone: false` — override.
- ALL components use **`ChangeDetectionStrategy.OnPush`** — always `markForCheck()` after async.
- DI via **`inject()`** function, not constructor params (except a few legacy: `HttpClient`, `NgZone`).
- Cleanup: **`Subject` + `takeUntil(this.destroy$)`** pattern in every component with subscriptions.
- Observable suffix `$` used inconsistently — `dataCache$`, `destroy$` but not others.

**TypeScript:**
- `strict: true` + `strictTemplates` + `noImplicitReturns` + `noPropertyAccessFromIndexSignature`.
- No `as any`, no `@ts-ignore`. One known exception: `uniforms: any` in WebGL service (documented tech debt).
- **No path aliases** — all imports use relative paths (`../../services/`).
- **No barrel exports** — no `index.ts` files anywhere.

**SCSS:**
- Desktop-first responsive (`max-width` breakpoints). Use `@include respond-tablet { }` etc.
- Self-hosted variable fonts (Inter, JetBrains Mono) — no Google Fonts CDN.
- CSS custom properties for theming: `--color-dark-*`, `--reflection-*`, `--accent-*`.
- `@property` declarations for smooth RGB transitions on theme switch.
- `glass-panel()` and `interactive-glow()` mixins for frosted-glass UI effects.

**Naming:**
- Files: `[name].component.ts`, `[name].service.ts`, `[name].pipe.ts`.
- Interfaces: bare PascalCase (`SidebarInfo`, `ArticleModel`), no `I` prefix.
- Constants: camelCase (`webglConfig`), not UPPER_SNAKE_CASE.

**Async:** RxJS only. No Promises. `catchError` → `console.error` → fallback via `of()`.

**Imports order:** Angular core → Angular features → third-party → RxJS → local services → local models.

## ANTI-PATTERNS (THIS PROJECT)

- **NEVER** use `100vh` — broken on mobile iOS. Use `100svh`, `100dvh`, or `--app-height` CSS var.
- **NEVER** use `@angular/flex-layout` — deprecated/archived Jan 2025.
- **NEVER** add `.eslintrc` or `.prettierrc` — project relies on TS strict mode only.
- **NEVER** use Promise-based async — use Observables everywhere.
- **NEVER** use deprecated `.subscribe(next, error, complete)` callback syntax — use object `{ next, error }`.
- **AVOID** `::ng-deep` — deprecated but still used for dynamic HTML content styling (blog). No replacement.
- **AVOID** adding path aliases (`@app/`) or barrel exports (`index.ts`) — not the project's pattern.

## KNOWN TECH DEBT

- `uniforms: any` in `GradientInstance` (webgl-gradient.service.ts:354) — needs proper interface.
- `bypassSecurityTrustHtml()` in blog-detail-page — markdown content not pre-validated.
- Event listeners in `GradientInstance` use arrow-field pattern (correct) but no WebGL context loss recovery.
- CV download uses unauthenticated GitHub API (60 req/hr limit).
- No global error handler.
- Test coverage ~43% — WebGL, blog markdown, and CV download paths undertested.

## COMMANDS

```bash
npm start              # ng serve (dev, http://localhost:4200)
npm run build          # ng build (production → dist/webcv-angular/)
npm test               # Jest (requires --experimental-vm-modules via node)
npm run test:watch     # Jest watch mode
```

## NOTES

- **WebGL is the heart**: `webgl-gradient.service.ts` (1180 lines) + `webgl.config.ts` (307 lines) are the most complex files. Service runs outside Angular zone for perf. CSS fallback exists for no-WebGL browsers.
- **Blog uses raw markdown**: No CMS. Posts are `.md` files with YAML front matter in `assets/data/blog/posts/`. Registered in `assets/data/blog/index.md`. Custom marked renderer handles headings, code blocks, syntax highlighting.
- **Reflections system**: WebGL gradient → emits RGB colors → `DynamicReflectionService` → sets CSS `--reflection-*` vars → SCSS `glass-panel()` / `interactive-glow()` use them → frosted-glass UI animates with background.
- **Theme switching**: Stored in `localStorage` under `webcv.themeName.v1`. Cycles through `webglConfig.background.colorSchemes`. Also updates `--accent-*` CSS vars for accent color changes.
- **Vercel deployment**: Analytics + Speed Insights lazy-loaded in `main.ts` (browser-only). Prerender enabled with `routes.txt`.
- **SSR configured but disabled**: `ssr: false` in angular.json, but `main.server.ts` + `app.config.server.ts` exist.
