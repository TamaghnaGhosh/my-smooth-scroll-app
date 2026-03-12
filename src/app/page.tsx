"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

export default function HomePage() {
  const homeRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const smoothScrollToRef = (ref: React.RefObject<HTMLDivElement | null>,offset = 0) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset") || "72px";
    const offset = parseInt(raw, 10) || 72;
    smoothScrollToRef(ref, offset);
  };

  // Scroll to section if hash exists (use offset-aware smooth scroll)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (!hash) return;
      const map: Record<string, React.RefObject<HTMLDivElement | null>> = {
        home: homeRef,
        profile: profileRef,
        settings: settingsRef,
      };
      const raw = getComputedStyle(document.documentElement).getPropertyValue("--scroll-offset") || "72px";
      const offset = parseInt(raw, 10) || 72;
      const ref = map[hash];
      if (ref) smoothScrollToRef(ref, offset);
    };

    // small delay for initial load to let layout settle
    setTimeout(handleHash, 120);
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // IntersectionObserver to toggle `.in-view` for section transitions
  useEffect(() => {
    const elements = [homeRef.current,profileRef.current,settingsRef.current].filter(Boolean) as HTMLDivElement[];
    if (!elements.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLDivElement;
          if (entry.isIntersecting) el.classList.add("in-view");
          else el.classList.remove("in-view");
        });
      },
      { threshold: 0.2 },
    );

    elements.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const renderSection = (
    ref: React.RefObject<HTMLDivElement | null>,
    id: string,
    title: string,
    bgColor: string,
    titleStyles: string,
  ) => (
    <div
      ref={ref}
      id={id}
      className="section flex items-center justify-center rounded-xl shadow-md mx-auto max-w-4xl"
      style={{ height: "400px", background: bgColor }}
    >
      <h2 className={`text-3xl font-semibold ${titleStyles}`}>{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Home Page
        </h1>

        {/* Buttons */}
        <div className="flex gap-4 flex-wrap justify-center mb-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            onClick={() => scrollToSection(homeRef)}
          >
            Home
          </button>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            onClick={() => scrollToSection(profileRef)}
          >
            Profile
          </button>

          <button
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            onClick={() => scrollToSection(settingsRef)}
          >
            Settings
          </button>
        </div>

        <Link
          href="/about"
          className="block text-center text-blue-600 hover:underline mb-10"
        >
          Go to About Page
        </Link>
      </div>

      {/* Spacer */}
      <div className="h-60" />

      {/* Home Section */}
      {renderSection(homeRef, "home", "Home Section", "#eee", "text-blue-800")}

      <div className="h-60" />

      {/* Profile Section */}
      {renderSection(profileRef,"profile","Profile Section","#ddd","text-green-800")}

      <div className="h-60" />

      {/* Settings Section */}
      {renderSection(settingsRef,"settings","Settings Section","#ccc","text-red-800")}
    </div>
  );
}
