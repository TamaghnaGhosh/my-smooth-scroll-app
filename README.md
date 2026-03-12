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

