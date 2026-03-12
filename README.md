## OVERVIEW.md File Start ##

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

## OVERVIEW.md File END
<!-- --------------------------------------------------------------------------------------------- -->

# Smooth Scroll App — Technical README

This README provides a code-level overview of the application: architecture, key files, and annotated snippets explaining how smooth scroll, offset handling, and entrance animations are implemented.

## Project Overview
- Framework: Next.js (app router). Client-side interactivity is implemented inside React client components.
- Goal: provide smooth, offset-aware scrolling to sections (`home`, `profile`, `settings`) plus subtle entrance animations when sections come into view.

## Key files
- `src/app/page.tsx` — main Home page with refs, scrolling helpers, hash handling, and `IntersectionObserver` for section animations.
- `src/app/globals.css` — global styles, `scroll-behavior: smooth`, `--scroll-offset`, and `.section` animation rules.
- `src/app/about/page.tsx` — links to section anchors (`/#profile`, `/#settings`) that rely on the Home page's hash handler.

## Code walkthrough (important snippets)

### Offset-aware smooth scroll helper (from `src/app/page.tsx`)

```ts
const smoothScrollToRef = (ref: React.RefObject<HTMLDivElement | null>, offset = 0) => {
	const el = ref.current;
	if (!el) return;
	const top = el.getBoundingClientRect().top + window.scrollY - offset;
	window.scrollTo({ top, behavior: 'smooth' });
};
```

What it does:
- Reads the element top relative to the viewport (`getBoundingClientRect().top`).
- Adds the current `window.scrollY` to convert it to a document coordinate.
- Subtracts `offset` (pixels) so the scrolled-to element sits below a fixed header.
- Calls `window.scrollTo({ behavior: 'smooth' })` to animate the scroll.

Usage: `scrollToSection(ref)` reads the CSS `--scroll-offset` and invokes `smoothScrollToRef(ref, offset)` so all programmatic scrolling respects the same offset.

---

### Hash/anchor handling

```ts
useEffect(() => {
	const handleHash = () => {
		const hash = window.location.hash.replace('#', '');
		if (!hash) return;
		const map = { home: homeRef, profile: profileRef, settings: settingsRef };
		const raw = getComputedStyle(document.documentElement).getPropertyValue('--scroll-offset') || '72px';
		const offset = parseInt(raw, 10) || 72;
		const ref = map[hash];
		if (ref) smoothScrollToRef(ref, offset);
	};
	setTimeout(handleHash, 120);
	window.addEventListener('hashchange', handleHash);
	return () => window.removeEventListener('hashchange', handleHash);
}, []);
```

What it does:
- Reads `window.location.hash` on load and on `hashchange` events.
- Maps the hash to the corresponding `RefObject` and calls the offset-aware helper.
- A small `setTimeout` on initial load gives the layout time to settle before scrolling.

---

### Entrance animation via IntersectionObserver

```ts
useEffect(() =&gt; {
	const elements = [homeRef.current, profileRef.current, settingsRef.current].filter(Boolean) as HTMLDivElement[];
	if (!elements.length) return;
	const obs = new IntersectionObserver((entries) =&gt; {
		entries.forEach((entry) =&gt; {
			const el = entry.target as HTMLDivElement;
			if (entry.isIntersecting) el.classList.add('in-view');
			else el.classList.remove('in-view');
		});
	}, { threshold: 0.2 });
	elements.forEach((el) =&gt; obs.observe(el));
	return () => obs.disconnect();
}, []);
```

What it does:
- Observes each section and toggles the `in-view` class when the section crosses the visibility threshold.
- The CSS for `.section` / `.section.in-view` performs opacity/translate transitions to animate the element.

---

### CSS: offset + native smooth scrolling (from `src/app/globals.css`)

```css
html { scroll-behavior: smooth; }
:root { --scroll-offset: 72px; }
.section { scroll-margin-top: var(--scroll-offset); }
.section { opacity: 0; transform: translateY(12px); transition: opacity 320ms ease, transform 320ms ease; }
.section.in-view { opacity: 1; transform: translateY(0); }
```

What it does:
- `scroll-behavior: smooth` enables smooth browser-native scrolling for anchor jumps.
- `--scroll-offset` centralizes the top offset value (useful to match a fixed header height).
- `scroll-margin-top` tells the browser to offset anchor/`scrollIntoView` landing position automatically.
- CSS transition rules animate sections as `in-view` is toggled by the observer.

---

## TypeScript considerations
- Refs are typed as `React.RefObject<HTMLDivElement | null>` to be precise and avoid type-predicate errors.
- When narrowing arrays with `.filter`, use a type predicate (or cast) to tell TypeScript the items are `HTMLDivElement[]`.
- When using `entry.target`, cast to `HTMLDivElement` to access element-specific properties with correct typing.

## Running the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and test:
- Click profile/settings buttons to test offset-aware smooth scrolling.
- Visit `/about` and click links to `/#profile` or `/#settings` to test fragment navigation.

## Next improvements (suggested)
- Measure header height dynamically instead of using a fixed `--scroll-offset`.
- Add unit tests around the helper(s) and small integration tests for hash handling.
- Add a small `Header` component and compute the offset from layout measurements.

---

If you want, I can also add inline comments to `src/app/page.tsx` explaining each helper directly in the source, or copy this README content into a shorter `README.nd` or other documentation format.

