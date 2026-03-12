# Smooth Scroll App — Technical Overview

This document explains the project at a code level: architecture, key files, scroll/animation implementation, TypeScript notes, and how to run and extend the app.

## Project summary
- Next.js (app router) single-page with three primary sections: `home`, `profile`, `settings`.
- Smooth scrolling behavior implemented both via native CSS (`scroll-behavior`) and a small JS helper to apply an adjustable top offset for anchor navigation.
- Section enter animations are handled with CSS transitions and an `IntersectionObserver` that toggles an `in-view` class.

## Key files
- File: [src/app/page.tsx](src/app/page.tsx#L1-L240)
  - Main page component. Uses React client component (`"use client"`) and `useRef` hooks to hold `HTMLDivElement` refs for each section.
  - Exposes buttons that call `scrollToSection(ref)` to smoothly scroll to a section.
  - Implements `smoothScrollToRef(ref, offset)` which computes the target top position as `element.getBoundingClientRect().top + window.scrollY - offset` and calls `window.scrollTo({ top, behavior: 'smooth' })` to respect a configurable offset (useful for fixed headers).
  - Handles initial hash fragments (`window.location.hash`) and `hashchange` events to scroll to anchors after load.
  - Uses `IntersectionObserver` to add/remove the `in-view` class on sections when they cross a visibility threshold (triggering CSS transitions).
  - Refs are typed as `React.RefObject<HTMLDivElement | null>` and the observer narrows to `HTMLDivElement` to avoid TypeScript type predicate issues.

- File: [src/app/globals.css](src/app/globals.css#L1-L200)
  - Global CSS. Declares `html { scroll-behavior: smooth; }` for native anchor scrolling.
  - Adds `--scroll-offset` CSS variable (default `72px`) and applies it as `scroll-margin-top` on `.section` so native anchors respect the top offset.
  - `.section` rules: initial `opacity: 0`, `transform: translateY(12px)`, and `transition: opacity 320ms ease, transform 320ms ease`. `.section.in-view` sets `opacity: 1` and `transform: translateY(0)`.

- File: [src/app/about/page.tsx](src/app/about/page.tsx#L1-L120)
  - Simple page with links to `/#profile` and `/#settings`. These links now correctly navigate to and trigger the offset-aware smooth scroll in `page.tsx`.

## Scroll + Animation flow (detailed)
1. CSS provides `scroll-behavior: smooth` for native anchor scrolling and `scroll-margin-top: var(--scroll-offset)` on `.section` so `element.scrollIntoView()` and jump-to-anchor account for a header offset.
2. When using programmatic scrolling from buttons or hash handling, `smoothScrollToRef` computes an explicit `top` value and calls `window.scrollTo({ top, behavior: 'smooth' })` so we can subtract the exact offset value read from `--scroll-offset`.
3. After layout loads, `hashchange` and an initial delayed call ensure the page scrolls to anchors once layout/container heights are stable.
4. `IntersectionObserver` watches sections and toggles `in-view`; CSS transitions animate opacity/translate for a pleasant entrance.

## TypeScript notes
- Refs use `HTMLDivElement` (not generic `HTMLElement`) because some DOM element types declare additional required properties; type predicates and casts were adjusted accordingly (e.g., `.filter((el): el is HTMLDivElement => el !== null)` and `const el = entry.target as HTMLDivElement`).
- Keep ref typing precise to avoid errors where TypeScript expects a property present on `HTMLDivElement` but missing on a looser `HTMLElement` type.

## How to run
1. Install dependencies (from repo root):

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Visit http://localhost:3000 (default Next.js port) and test:
- Navigate to `/about` and click the links to test fragment navigation.
- Use the Home page buttons to test programmatic smooth scroll.

## Customization points
- Offset: Change `--scroll-offset` in `src/app/globals.css` to match any fixed header height.
- Transition timing: Modify the `transition` durations or easing in `.section`.
- Observer threshold: Tweak the `IntersectionObserver` threshold (currently ~0.2) for earlier/later animations.
- Add debounce/throttle to scroll saving if you need performance improvements for very long pages.

## Common troubleshooting
- If anchors jump before the layout fully paints, increase the initial `setTimeout` delay used by the hash handler or ensure layout-critical fonts/styles are preloaded.
- If a section doesn't animate, verify that the element has `class="section"` and that the observer is registering it (use devtools to inspect `IntersectionObserver` callbacks).
- If TypeScript complains about element properties, ensure the ref types are `HTMLDivElement` or the correct specific element type.

## Next improvements (suggested)
- Add a small header component and read `--scroll-offset` dynamically from its measured height (instead of a fixed CSS value).
- Implement page-to-page route transitions using Next.js `layout.tsx` with a shared animation context.
- Polyfill or graceful fallback for browsers that do not support `scroll-behavior` (older browsers).

---
Generated: technical README.nd describing code-level design and how smooth scroll + animations are implemented.
