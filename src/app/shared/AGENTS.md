# SHARED COMPONENTS

Reusable UI building blocks used across all pages. Every component here is standalone + OnPush.

## STRUCTURE

```
shared/
├── header/              # Top nav — theme switcher, CV download button, route links
├── footer/              # Simple footer
├── sidebar/             # Left panel on home — avatar, name, contact links, social
├── webgl-background/    # Hosts the WebGL canvas (delegates to WebGLGradientService)
├── intro-overlay/       # First-visit typewriter animation (skippable, respects prefers-reduced-motion)
├── modal-dialog/        # Generic modal wrapper
├── horizontal-separator/
├── vertical-separator/
├── components/
│   └── copy-button/     # Clipboard copy with success/error feedback animation
└── pipes/
    ├── duration.pipe.ts     # Formats date ranges ("Jan 2020 – Present")
    └── month-short.pipe.ts  # Month number → short name ("1" → "Jan")
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add nav link / feature flag | `header/` | Reads `HeaderConfig` from `HomeDataService` for `isPortfolioDone`, `isBlogDone` |
| Change glass/frosted effect | `_mixins.scss` → `glass-panel()` | Uses `--reflection-*` CSS vars from `DynamicReflectionService` |
| Change hover glow effect | `_mixins.scss` → `interactive-glow()` | Uses reflection vars + `box-shadow-16`, `text-glow-12` extends |
| WebGL canvas setup | `webgl-background/` | Thin wrapper — all logic in `WebGLGradientService` |
| Intro animation | `intro-overlay/` | localStorage flag `webcv.introSeen.v1` controls skip behavior |
| Add reusable component | Create dir here | Follow `standalone: true` + `OnPush` + separate `.component.scss` |

## CONVENTIONS

- **All components**: `standalone: true`, `ChangeDetectionStrategy.OnPush`, separate SCSS file.
- **DI**: Use `inject()` function, not constructor params.
- **Cleanup**: `destroy$ = new Subject<void>()` + `takeUntil(this.destroy$)` in `ngOnDestroy`.
- **Styling**: Component-scoped SCSS. Use `glass-panel()` or `interactive-glow()` mixins for frosted effects — never hand-roll backdrop-filter.
- **Separators**: `horizontal-separator` and `vertical-separator` are pure presentational — no logic.

## ANTI-PATTERNS

- **NEVER** create a shared NgModule — all components are standalone imports.
- **NEVER** add `index.ts` barrel exports — import each component directly.
- **NEVER** use `ViewEncapsulation.None` — rely on component scoping. Exception: `::ng-deep` in blog for dynamic HTML.
- **NEVER** put page-specific logic here — shared components must be page-agnostic.
