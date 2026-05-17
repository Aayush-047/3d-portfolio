# Aayush Khunger 3D Portfolio Gallery

A cinematic, scroll-driven 3D portfolio built with React, Vite, Three.js, and React Three Fiber. The experience opens with an animated intro and transitions into a museum-style gallery where portfolio sections are presented as framed exhibits.

## Stack

- React 18
- Vite 6
- Three.js
- React Three Fiber
- Drei
- Tailwind CSS
- Netlify deployment config

## Features

- Scroll-controlled camera path through a 3D gallery
- Lazy-loaded intro scene, sculpture canvas, and gallery canvas
- Demand-based gallery rendering with constrained DPR for better performance
- Responsive camera positioning for desktop, tablet, and mobile
- Custom cursor for pointer devices
- Netlify-ready redirects, cache headers, and build settings
- SVG favicon with an `AK` gold monogram

## Getting Started

Install dependencies:

```bash
npm ci
```

Run the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```txt
src/
  App.jsx                    App shell and lazy loading
  components/                Navbar, loader, cursor, gallery canvas
  intro/                     Intro scene and intro sculpture canvas
  scene/                     3D gallery, camera rig, exhibit frame
  data/                      Exhibit content and layout
public/
  background-image-3d.avif   Intro background image
  favicon.svg                AK monogram favicon
  _headers                   Static host cache/security headers
  _redirects                 SPA fallback redirect
```

## Performance Notes

The heavy 3D dependencies are split into separate vendor chunks. The main app loads first, then the intro sculpture and gallery are lazy-loaded so the initial page is not blocked by the full gallery scene.

Current production build is roughly:

```txt
dist total:       ~1.2 MB raw
gzip total:       ~368 KB
brotli total:     ~315 KB
largest chunk:    three.js vendor chunk
```

For a React Three Fiber portfolio, this is a deployable size. The largest payload is Three.js itself, which is expected for this type of experience.

## Deployment

Netlify is the recommended deployment target because this repo already includes `netlify.toml`, `_headers`, and `_redirects`.

1. Push the repo to GitHub.
2. In Netlify, create a new site from the repository.
3. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `20`
4. Deploy.

The Netlify config handles immutable caching for hashed assets, caching for image files, and SPA fallback routing.
