# Tanvir Jahan · Portfolio 2026

![Tanvir Jahan and an original particle sculpture](public/social-cover.png)

A Next.js App Router portfolio for Tanvir Jahan, a full-stack developer and software engineer in Rajshahi, Bangladesh. The primary experience is a server-rendered project index, with three case studies, professional experience and direct contact links. A separate interactive route presents the work as four particle studies.

## Run locally

Use Node.js 22.13 or newer and npm.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Visit [/experience](http://localhost:3000/experience) to enter the 3D presentation. The standard portfolio also opens at `/?v=site`.

## Validate and serve a production build

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

## Design and rendering

The entrance and browsing modes of [Inácio Nakiti’s portfolio](https://inacionakiti.com/?v=site) informed the orbital composition, spare masthead, typographic scale and short path between experiences. This implementation uses an original TJ mark, a mint-on-charcoal palette and a parametric orbital field. The images in the case studies come from Tanvir’s own projects.

- The standard portfolio and case studies render their text and navigation on the server. The hero uses a small WebGL point shader, adjusts particle density to the display, and suspends rendering offscreen or in a hidden tab. Its static WebP rendering is available before JavaScript loads and for reduced-motion or WebGL fallback.
- The immersive route loads Three.js and React Three Fiber separately. One point cloud changes between an orbit, an operational grid, stacked product layers and a desk. Visitors choose chapters directly, pause motion, opt into synthesized sound or exit at any point.
- The site serves Geist fonts locally and uses CSS, the Web Animations API and native scrolling. Project images use Next.js image optimization. No database, authentication or API keys are required.

## Content and project previews

Edit project records, contact information, experience, skills and chapter descriptions in `lib/content.ts`. The shared orbital geometry is in `lib/orbit.ts`.

| Project | Public sources and preview provenance |
| --- | --- |
| AgencyDesk | [Repository](https://github.com/TanvirJahan001/AgencyDesk) and [read-only demo](https://agency-desk-six.vercel.app/demo). The preview shows the sample dashboard. |
| Mobile Accessories Store | [Repository](https://github.com/TanvirJahan001/AI-Ecommerce) and [product screenshot](https://github.com/TanvirJahan001/AI-Ecommerce/blob/HEAD/artifacts/desktop-charger.png). The case study describes the local development application and its simulated checkout. |
| 3D Developer Desk | [Repository](https://github.com/TanvirJahan001/threejs-room-animation) and [interactive scene](https://threejs-room-animation.vercel.app/). The preview is a camera view captured from the running scene. |

Professional details follow the owner’s [previous portfolio](https://github.com/TanvirJahan001/My-React-Portfolio) and [public profile](https://github.com/TanvirJahan001). The email link opens the visitor’s mail client.

## Deployment

Import this GitHub repository into Vercel, select the Next.js preset and the repository root, and use the standard install and build commands. For a custom domain, set `SITE_URL` to its full HTTPS origin before building. On Vercel the app can also use `VERCEL_PROJECT_PRODUCTION_URL`. The site uses the configured origin for canonical links, social metadata and the sitemap. Without a configured origin, the sitemap uses the incoming request origin and canonical links are omitted.

Metadata endpoints include `/robots.txt`, `/sitemap.xml` and `/social-cover.png`.
