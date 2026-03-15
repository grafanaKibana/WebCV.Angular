# WebCV.Angular

Personal CV / portfolio website built with Angular 18. Features an animated WebGL gradient background, a markdown-powered blog, and data-driven resume sections — all wrapped in a polished dark-themed UI.

**Live**: [reshetnik.vercel.app](https://reshetnik.vercel.app) · **Repo**: [github.com/grafanaKibana/WebCV.Angular](https://github.com/grafanaKibana/WebCV.Angular)

![Screenshot](screenshot-full.png)

## Features

- **WebGL gradient background** — animated mesh gradient with parallax, dynamic color themes, and real-time UI reflections
- **Intro overlay** — typewriter-style intro sequence on first visit (skippable, respects `prefers-reduced-motion`)
- **Data-driven content** — all resume data (experience, education, skills, sidebar info) loaded from a single JSON config
- **Markdown blog** — blog posts authored in Markdown with YAML front matter, syntax highlighting via highlight.js
- **CV download** — fetches the latest PDF from a [LaTeX CV repo](https://github.com/grafanaKibana/LatexCV) via GitHub Actions artifacts
- **Route animations** — smooth page transitions between Home, Blog, and Portfolio
- **Responsive design** — mobile-friendly layout with SCSS mixins and media queries

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 18 (NgModules) |
| Language | TypeScript 5.5 |
| Styling | SCSS, Angular Material, FontAwesome |
| Graphics | Custom WebGL gradient renderer |
| Blog | Markdown (`marked`), highlight.js |
| Testing | Jest, jest-preset-angular |
| Analytics | Vercel Analytics, Vercel Speed Insights |
| Node | 22 (see `.nvmrc`) |

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── home/           # About, Experience, Education, Skills sections
│   │   ├── blog/           # Blog listing, detail page, markdown parser
│   │   └── portfolio/      # Portfolio page (WIP)
│   ├── shared/             # Header, Footer, Sidebar, WebGL background, Intro overlay
│   ├── services/           # Home data, CV download, WebGL gradient, dynamic reflections
│   └── config/             # WebGL configuration
├── assets/
│   ├── data/
│   │   ├── home-data.json  # All resume content
│   │   └── blog/           # Blog posts (Markdown + images)
│   ├── images/
│   └── styles/             # Global SCSS variables, mixins, typography
└── environments/
```

## Getting Started

### Prerequisites

- Node.js 22 (`nvm use` if you have nvm)
- Angular CLI (`npm install -g @angular/cli`)

### Install & Run

```bash
npm install
ng serve
```

Open [http://localhost:4200](http://localhost:4200).

### Build

```bash
ng build
```

Production artifacts go to `dist/webcv-angular/`.

### Test

```bash
npm test              # single run
npm run test:watch    # watch mode
```

## Customization

All resume content lives in [`src/assets/data/home-data.json`](src/assets/data/home-data.json) — edit it to make the site yours. Blog posts go in `src/assets/data/blog/posts/` as Markdown files with YAML front matter.
