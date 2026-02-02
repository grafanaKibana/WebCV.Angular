---
id: 1
headline: "Prompting with a human-in-the-loop: Figma, Chrome DevTools, and MCPs"
topics:
  - Prompting
  - UX
  - MCP
  - Testing
publishDate: "2024-07-03"
imagePath: "hero.png"
author:
  name: "Nikita Reshetnik"
  title: ".NET / AI Engineer"
  avatarUrl: "./assets/images/my-portrait.png"
---
I'm mostly the back-end developer, but recently, my team asked me to help with fixing some critical bugs on the React front-end application, with which I don't have commercial experience at all.
But the product doesn't care. It needs to be fixed yesterday, no matter what. And I thought it was a great way to improve my "vibecoding" skills.
So I decided to try a more sophisticated approach that chatting with an agent, describing to him what to fix and where he failed.

## Prerequisites
The good news is that I have a proper set of tools and well-defined criteria:
- Jira ticket with proper Acceptance Criteria and steps-to-reproduce
- Access to the Figma designs, and dev seat(important).
- Cursor license with almost unlimited usage limits and the latest models.

And moreover, we are allowed and not limited with MCP usages, which was core of my human-in-loop interactions. So I can connect the documentation and design to the Cursor via MCP.
In addition to the task context, I've also used an additional free MCP that made the workflow finished: Chrome-DevTools to allow an agent to interact with a real browser and check his progress.

At this stage, we are ready to fix the bugs!

## Step 1: Plan
For this step, I recommend using some high-thinking models like Claude Opus 4.5 High Thinking, or GPT Codex 5.2 xhigh. While it will take a while to do everything, the chances on the one-shot fixes will be much hight later.

The whole prompting and agent-driven development success is based on how well you manage your request context. It includes your request prompt, agent static instructions and rules, skills, linked files, and available tools.
To make this context consistent, before any execution I like to create a comprehensive plan of the task to resolve, to make agent always have relevant and consistent information, atomizing subtasks and tracing the progress.
To achieve that, I usually ask for a human-in-loop multi-stage planning to fix the X ticket (you can paste the ticket description right away OR use just the ticket number if you have Jira MCP enabled). 
To achieve human-in-loop here, always add to the prompt, or the agent instructions statement that will force the agent to ask you a set of the questions iteratively, until the agent will have enough information to progress with planning.
The agent should precisely read your jira ticket, screenshot the designs, ask you some questions, and finalize a plan that you can review and adjust manually after if needed.
If you are still unhappy with details of the plan, you always can ask for the planning and researching each phase separately, of course, with a questionnaire.

The final plan might look something like this:
```markdown
# Plan: UI Consistency + iOS Safe-Area + Blog Polish + Background Memory
**Generated**: January 23, 2026
**Estimated Complexity**: High

## Overview
Fix a set of cross-page UI consistency issues (spacing + radii), iOS Safari safe-area background gaps (status bar + bottom bar), blog layout overflows, and suspected memory growth likely linked to WebGL background + viewport-height updates.

Key idea: treat the blog post mobile paddings (blog detail page) as the “source of truth”, systemize them into layout tokens, then remove per-page/per-section overrides that diverge (notably Skills, Experience/Education row internals, and some Blog nested radii). For iOS, make the WebGL background cover the full viewport (including safe areas) and avoid body fallback color bleeding through. For memory, reduce resize thrash and per-tick allocations, and validate with repeatable profiling.

## Prerequisites
- Ability to test on:
  - iOS Safari (real device preferred) with notch + bottom bar
  - Desktop Chrome/Safari
- Chrome DevTools Memory/Performance panels (or Safari Web Inspector)
- Agree on the “UI rules”:
  - **Radius**: surface > card > inner > control (nested elements smaller)
  - **Spacing**: use blog post mobile paddings as a baseline (then apply everywhere)

## Checklist (tick only after verified)
- [ ] Sprint 1: Normalize spacing + radii (Home + global tokens)
  - [X] Task 1.0: Stop background memory growth (top priority)
  - [ ] Task 1.1: Systemize page/section paddings from blog post mobile
  - [ ] Task 1.2: Define semantic radius tokens + nested rule
  - [ ] Task 1.3: Keep contact icons, remove square background
  - [ ] Task 1.4: Fix Experience/Education row horizontal padding balance
  - [ ] Task 1.5: Treat Skills as paddingless section (no shadow)
- [ ] Sprint 2: iOS safe-area background + footer overscroll
  - [ ] Task 2.1: Background covers notch + Safari bottom bar
  - [ ] Task 2.2: Improve body fallback background (backstop)
  - [ ] Task 2.3: Footer not cut off on overscroll
- [ ] Sprint 3: Blog polish (radii + overflow + hero footer layout)
  - [ ] Task 3.1: Standardize blog nested radii
  - [ ] Task 3.2: Fix share links block sizing/overflow
  - [ ] Task 3.3: Fix hero footer “stairs” layout
- [ ] Sprint 4: Investigate + fix background memory growth
  - [ ] Task 4.1: Repro + measure memory growth
  - [ ] Task 4.2: Throttle viewport height updates
  - [ ] Task 4.3: Reduce gradient hot-path allocations (if needed)
  - [ ] Task 4.4: Verify cleanup + singleton behavior

## Canonical UI Tokens (radii + nested corners)
For a “canonical” radius approach, the most widely published public guidance is Material Design’s shape scale: define a small set of corner-radius tokens and apply them consistently by component type (surface/card/control), rather than inventing per-component values.

For nested rounded rectangles, the practical rule is: inner elements should have smaller radii than the parent (often computed as “parent radius minus inset/padding”), otherwise the arcs look visually wrong. This is also reflected by common design-tool workflows (e.g., “nested corners” plugins).

In this repo we already have a clean radius set (`--radius-4/8/12/16/20/32`). The plan below implements semantic aliases (surface/card/inner/control) and applies a consistent step-down rule (and “subtract padding” where it matters, e.g., media clipped inside cards).

References (for the “canonical approach” discussion):
- `https://material-web.dev/theming/shape/`
- `https://developer.android.com/reference/kotlin/androidx/compose/material3/Shapes`
- `https://developers.google.com/cars/design/automotive-os/design-system/shapes`
- `https://mui.com/material-ui/customization/shape/`
- `https://help.figma.com/hc/en-us/articles/360050986854-Adjust-corner-radius-and-smoothing`

## Execution Notes
Sprint 1 is implemented in code, but the Sprint 1 checkboxes stay unchecked until you confirm each item visually (mobile + desktop).

Sprint 1 code changes:
- `src/assets/styles/variables/_vars.scss` (added `--page-pad/--section-pad/--section-gap` and semantic `--radius-*` aliases)
- `src/assets/styles/_general.scss` (global `section` now uses `--section-pad/--section-gap`; mobile padding increased to match blog feel)
- `src/assets/styles/_utility.scss` (uses `--radius-surface` for `.dark-block`)
- `src/app/shared/sidebar/sidebar.component.html` (removed `.dark-block` from contact icon boxes)
- `src/app/shared/sidebar/sidebar.component.scss` (contact icons are visible; no square/glass background)
- `src/app/pages/home/home.scss` (removed per-item right padding; reverted left spacing; expanded content uses no extra right padding)
- `src/app/pages/home/skills-section/skills-section.component.scss` (Skills section: no padding, no shadow, transparent background)
- `src/main.ts` (throttled `--app-height` updates to RAF + only when height changes)
- `src/app/services/webgl-gradient.service.ts` (guard against duplicate gradients; stop RAF loop reliably; reduce allocations on color emission)

## Sprint 1: Normalize spacing + radii rules (cross-app)
**Goal**: Establish consistent tokens and align existing components to them without changing the overall aesthetic.
**Demo/Validation**:
- Home sections (Experience/Education/Skills) visually align with the same horizontal rhythm.
- Blog surfaces follow nested radius rules (no same-radius nesting).

### Task 1.0: Investigate + stop background memory growth (top priority)
- **Location**: `src/main.ts`, `src/app/services/webgl-gradient.service.ts`, `src/app/shared/webgl-background/webgl-background.component.ts`
- **Description**: Fix the likely causes of runaway memory/CPU:
  - prevent duplicate gradient instances on the same container,
  - ensure `destroy()` cannot leave an orphaned RAF loop running,
  - throttle `--app-height` updates so they only happen when height actually changes (coalesced via RAF).
- **Complexity**: 8/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - Leaving the app idle for 2–3 minutes does not show runaway memory growth or severe lag.
  - Navigating routes does not leave detached canvases/RAF loops behind.
- **Validation**:
  - Chrome Task Manager / DevTools Memory: memory curve stabilizes (or grows slowly then plateaus).
  - Heap snapshot: no accumulating detached canvases.

### Task 1.1: Systemize page/section paddings based on blog post mobile
- **Location**: `src/assets/styles/variables/_vars.scss`, `src/assets/styles/_general.scss`
- **Description**: Introduce semantic spacing tokens (e.g. `--page-pad`, `--section-pad`, `--section-gap`) and set them so the global mobile section padding matches the blog post mobile feel. Then refactor global `section { padding: ...; margin-bottom: ... }` to use those tokens so other pages can converge without custom overrides. (Adopt tokens in page-level SCSS gradually; avoid changing the blog post visuals.)
- **Complexity**: 6/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - Blog post (detail page) looks unchanged on mobile.
  - Other pages converge toward the same padding system (fewer one-off paddings).
- **Validation**:
  - Compare `/blog/:slug` padding at 375px before/after (should match).
  - Spot-check Home/Portfolio/Blog index for consistent rhythm.

### Task 1.2: Define semantic radius tokens + nested rule (recommended)
- **Location**: `src/assets/styles/variables/_vars.scss`
- **Description**: Add semantic CSS vars mapping to existing radii (e.g. `--radius-surface`, `--radius-card`, `--radius-inner`, `--radius-control`) and document a simple rule:
  - same-surface nesting is not allowed (child must step down at least one token),
  - when a child is inset (padding/border), set `childRadius = max(parentRadius - inset, nextTokenDown)` to avoid arc mismatch.
- **Complexity**: 3/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - Tokens exist and map to current `--radius-*` values.
  - No visual changes yet (until adopted).
- **Validation**:
  - Quick grep confirms tokens are used where intended in later tasks.

### Task 1.3: Keep contact icons, remove square background
- **Location**: `src/app/shared/sidebar/sidebar.component.html`, `src/app/shared/sidebar/sidebar.component.scss`
- **Description**: Keep the contact icons visible, but remove the square/glass background (no `.dark-block` surface, no box-shadow). This should apply to all breakpoints.
- **Complexity**: 2/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - Icons are visible on desktop + mobile.
  - No “square glass tile” behind the icon; it’s just an icon + text.
- **Validation**:
  - Check at desktop + mobile widths.

### Task 1.4: Fix Experience/Education row horizontal padding asymmetry
- **Location**: `src/app/pages/home/home.scss`, `src/app/pages/home/experience-section/experience-section.component.scss`, `src/app/pages/home/education-section/education-section.component.scss`
- **Description**: Adjust `.section-item` / `.section-item-content` so left and right padding feel balanced. Current symptoms match `padding-left` being small (border-left + `--spacing-4`) while `.section-item-content` has a large `padding-right: var(--spacing-8)`.
- **Complexity**: 5/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - Experience/Education rows have consistent left/right padding.
  - No horizontal overflow; date column alignment remains correct.
- **Validation**:
  - Check at desktop, 1200px, 768px, 576px widths.

### Task 1.5: Treat Skills as paddingless section (no shadow)
- **Location**: `src/app/pages/home/skills-section/skills-section.component.scss`
- **Description**: Keep Skills section intentionally different from “dark-block sections”: no section background, no section box-shadow, and smaller/no outer padding (so it doesn’t look like an empty padded block). Ensure internal cards keep their own spacing.
- **Complexity**: 4/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - Skills section has minimal/no outer padding and no shadow.
  - Skills content still aligns nicely with surrounding sections.
- **Validation**:
  - Compare Skills section to surrounding Home sections at multiple breakpoints.

## Sprint 2: iOS safe-area background coverage + footer overscroll
**Goal**: Background is visible behind iPhone status bar + Safari bottom bar, and overscroll doesn’t expose “dead” background areas or clip the footer.
**Demo/Validation**:
- On iPhone Safari, the gradient background is visible behind the notch/time area and behind the bottom toolbar.
- Overscrolling bottom shows a continuous background and the footer isn’t visually cut.

### Task 2.1: Make WebGL background cover the full viewport + safe areas
- **Location**: `src/app/shared/webgl-background/webgl-background.component.scss`, `src/assets/styles/variables/_vars.scss`
- **Description**: Change `.webgl-background-container` sizing from `height: var(--app-height, 100vh)` to a strategy that covers both:
  - the dynamic viewport for content layout, and
  - the full device viewport including safe areas (status bar + bottom bar).
  Possible approach: `position: fixed; inset: 0;` and avoid relying solely on `--app-height` for background coverage.
- **Complexity**: 6/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - No black/blank bars at top/bottom on iOS Safari.
  - No “gap” appears during toolbar show/hide.
- **Validation**:
  - Real-device test: scroll a page and watch the Safari chrome expand/collapse; background remains continuous.

### Task 2.2: Prevent body fallback color from showing through safe-area gaps
- **Location**: `src/assets/styles/_general.scss`
- **Description**: Update `body { background-color: black; }` to a safer fallback that won’t visibly “break” if any gap occurs (e.g. transparent, or a color derived from theme). This is a backstop; the primary fix is Task 2.1.
- **Complexity**: 3/10
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - Even if the WebGL background fails, the app doesn’t flash stark black around safe areas.
- **Validation**:
  - Force WebGL off (Safari develop menu / disable WebGL) and confirm fallback looks intentional.

### Task 2.3: Fix footer cut-off on bottom overscroll
- **Location**: `src/app/app.component.scss`, `src/app/shared/footer/footer.component.scss`, `src/main.ts`
- **Description**: Ensure the layout accounts for `env(safe-area-inset-bottom)` and the dynamic viewport height so the footer background and content aren’t clipped during rubber-band overscroll. Likely involves shifting “safe bottom” responsibility to the footer/container instead of only the wrapper padding, and/or ensuring the background extends beyond `--app-height`.
- **Complexity**: 6/10
- **Dependencies**: Task 2.1
- **Acceptance Criteria**:
  - Footer remains fully visible during bottom overscroll.
  - No horizontal/vertical clipping artifacts.
- **Validation**:
  - iPhone Safari: overscroll bottom and confirm footer + background remain continuous.

## Sprint 3: Blog layout polish (radii, overflow, hero footer)
**Goal**: Blog pages match global spacing/radius rules and remain stable on mobile widths.
**Demo/Validation**:
- No horizontal overflow on `/blog` or `/blog/:slug`.
- Hero footer meta doesn’t “stair-step”.
- Nested radii follow the rule: inner elements have smaller radii.

### Task 3.1: Standardize blog nested radii
- **Location**: `src/app/pages/blog/blog.scss`
- **Description**: Adjust radii so containers use larger radii than nested elements (e.g. blog grid surface `20`, blog cards `16`, inner elements `12/8`). Avoid “20 inside 20” where it looks inconsistent.
- **Complexity**: 5/10
- **Dependencies**: Task 1.1 (if semantic tokens added)
- **Acceptance Criteria**:
  - Blog grid/cards/inner media look consistently nested.
- **Validation**:
  - Visual check at desktop + mobile widths.

### Task 3.2: Fix share links block sizing + overflow in blog hero
- **Location**: `src/app/pages/blog/blog.scss`, `src/app/pages/blog/blog-detail-page/blog-detail-page.component.html`
- **Description**: Ensure the share links cluster (`.blog-share--icons`) doesn’t exceed the viewport on small screens and doesn’t feel disproportionately large vs desktop. Likely changes:
  - allow wrapping inside the share cluster
  - clamp padding/gaps at small breakpoints
  - ensure flex items can shrink (`min-width: 0`) and don’t push content outside
- **Complexity**: 5/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - No horizontal scroll caused by the share block.
  - Share block size feels consistent vs desktop while preserving touch targets.
- **Validation**:
  - Test at 375px width with long headlines.

### Task 3.3: Fix blog hero footer “stairs” layout
- **Location**: `src/app/pages/blog/blog.scss`
- **Description**: Replace the current `.blog-hero__meta` flex-wrap behavior with a layout that keeps author + meta aligned cleanly:
  - Grid layout (two columns: author left, meta right) for wide view
  - Single-column stack for narrow view
- **Complexity**: 4/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - Author and meta don’t overlap or form a stair-step at common mobile widths.
- **Validation**:
  - Test multiple viewport widths and long author/title strings.

## Sprint 4: Investigate + fix background-related memory growth
**Goal**: Stop uncontrolled memory growth (20–30MB/s) and ensure the WebGL background is stable over time.
**Demo/Validation**:
- On desktop, leaving the app open for 3–5 minutes does not show runaway memory growth.
- On iOS Safari, scrolling doesn’t cause progressive memory blow-up.

### Task 4.1: Reproduce + measure memory growth with a checklist
- **Location**: (process) + optionally add temporary debug logs in `src/app/services/webgl-gradient.service.ts`
- **Description**: Document a repeatable repro:
  - “Idle on Home for 2 minutes”
  - “Scroll continuously for 30 seconds”
  - “Switch routes 10 times”
  Measure: JS heap, total memory (Chrome task manager), number of canvases, and active gradient instances.
- **Complexity**: 4/10
- **Dependencies**: none
- **Acceptance Criteria**:
  - We can consistently reproduce or rule out the growth.
- **Validation**:
  - Save screenshots / numbers before/after.

### Task 4.2: Throttle viewport height updates to avoid resize thrash
- **Location**: `src/main.ts`
- **Description**: `setViewportVars()` is currently called on `visualViewport.scroll` and `visualViewport.resize` without change detection. Update it so it:
  - only sets `--app-height` when the computed height actually changes (ideally integer-rounded),
  - is coalesced via `requestAnimationFrame` to avoid update storms.
- **Complexity**: 6/10
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - `--app-height` updates don’t fire at scroll-event frequency.
  - Background canvas resizes only when needed.
- **Validation**:
  - Add a temporary counter/log and verify update rate drops dramatically.

### Task 4.3: Reduce per-tick allocations in the gradient loop (if needed)
- **Location**: `src/app/services/webgl-gradient.service.ts`
- **Description**: If profiling shows GC pressure, remove hot-path deep clones (e.g. `JSON.parse(JSON.stringify(...))`) and replace with minimal copying/reuse of arrays for `currentColors/lastEmittedColors`.
- **Complexity**: 7/10
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - GC and allocation rate drop in Performance panel.
  - Visual output unchanged.
- **Validation**:
  - Compare allocation timelines before/after.

### Task 4.4: Verify cleanup paths and singleton behavior
- **Location**: `src/app/shared/webgl-background/webgl-background.component.ts`, `src/app/services/webgl-gradient.service.ts`
- **Description**: Confirm we never accidentally create multiple gradients/canvases for the same container, and that `destroy()` removes listeners/observers/canvas. Add guards if needed.
- **Complexity**: 4/10
- **Dependencies**: Task 4.1
- **Acceptance Criteria**:
  - Exactly one canvas exists for the background at runtime.
  - No detached canvases accumulate after navigation.
- **Validation**:
  - DOM inspection + heap snapshot (detached nodes).

## Testing Strategy
- **Visual regression (manual)**:
  - Desktop: 1440px, 1200px, 992px, 768px, 576px, 375px widths
  - iPhone Safari: scroll, rotate, open/close bottom chrome
- **Behavioral**:
  - No horizontal scroll on Blog pages.
  - Footer visible at bottom, including overscroll.
- **Performance/memory**:
  - Chrome Task Manager + DevTools Memory snapshots before/after.
  - Confirm stable memory curve over 3–5 minutes.

## Potential Risks
- iOS viewport + safe-area behavior is brittle; changes may fix one case and regress another (toolbar show/hide, orientation changes).
- Background “cover full viewport” changes can affect click/scroll if z-index/pointer-events aren’t correct.
- Memory fixes might require tradeoffs between visual fidelity (DPR) and stability.

## Rollback Plan
- Keep changes isolated to:
  - background sizing (`webgl-background.component.scss`)
  - viewport var updates (`main.ts`)
  - blog styles (`blog.scss`)
  - specific home section styles
- If a regression appears, revert the specific sprint’s commits without touching unrelated styling.
```

Plan is ready, proceed to the execution!

## Step 2: Doing things
So you planned everything well, confirmed the plan as an advanced LLM operator, only thing left is to ask LLM to fix everything!
Sure, but remember to ask the agent explicitly to confirm everything executing the DevTools MCP and confirm functionally and visually that everything works.
Don't underestimate the power of that MCP: it could browse the pages, fill the forms, execute validation scripts, and en do a profiling of the app!

## Chrome DevTools MCPs for reality checks

MCPs let you feed the model real runtime context: DOM nodes, network responses, and layout changes. It is the fastest way to validate that prompts behave in the actual UI.

- Capture live DOM snapshots to verify selectors and labels.
- Record edge states (empty lists, errors, latency) to harden prompts.
- Replay results with human approval before shipping.

> A good prompt is a tested UX decision, not a clever sentence.
