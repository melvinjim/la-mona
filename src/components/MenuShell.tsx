"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CategoryIcon } from "@/lib/types";
import { categoryIcons } from "./category-icons";

export type NavCategory = {
  id: string;
  label: string;
  icon: CategoryIcon;
  count: number;
};

/** Devuelve el id de la sección que está bajo la barra pegajosa mientras se hace scroll. */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = parseFloat(getComputedStyle(sections[0]).scrollMarginTop) || 0;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= offset + 48) current = section.id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}

export function MenuShell({
  categories,
  children,
}: {
  categories: NavCategory[];
  children: ReactNode;
}) {
  const ids = useMemo(() => categories.map((category) => category.id), [categories]);
  const active = useScrollSpy(ids);
  const barRef = useRef<HTMLDivElement>(null);

  // Mantiene visible el chip activo en la barra horizontal del celular.
  useEffect(() => {
    const bar = barRef.current;
    const chip = bar?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!bar || !chip || bar.clientWidth === 0) return;
    bar.scrollTo({
      left: chip.offsetLeft - (bar.clientWidth - chip.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <div
      id="menu"
      className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-4 sm:px-8 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-10"
    >
      {/* Escritorio: lista lateral pegajosa */}
      <aside className="hidden lg:block">
        <nav
          aria-label="Categorías del menú"
          className="sticky top-28 pt-8"
        >
          <p className="mb-3 px-3 font-display text-sm font-bold uppercase tracking-[0.22em] text-ink-soft">
            Categorías
          </p>
          <ul className="space-y-1">
            {categories.map(({ id, label, icon, count }) => {
              const Icon = categoryIcons[icon];
              const isActive = active === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition ${
                      isActive
                        ? "bg-ink text-white"
                        : "text-ink hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <Icon
                      className={`size-5 ${isActive ? "text-brand-400" : "text-brand-600"}`}
                      aria-hidden="true"
                    />
                    {label}
                    <span
                      className={`ml-auto text-xs font-bold tabular-nums ${isActive ? "text-white/60" : "text-ink-soft"}`}
                    >
                      {count}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="min-w-0">
        {/* Celular y tablet: chips horizontales pegajosos */}
        <nav
          aria-label="Categorías del menú"
          className="sticky top-0 z-30 -mx-4 bg-cream/95 shadow-[0_10px_14px_-12px_rgb(26_26_22/0.35)] sm:-mx-8 lg:hidden"
        >
          <div
            ref={barRef}
            className="no-scrollbar relative flex gap-2 overflow-x-auto px-4 py-2.5 sm:px-8"
          >
            {categories.map(({ id, label, icon }) => {
              const Icon = categoryIcons[icon];
              const isActive = active === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  data-id={id}
                  aria-current={isActive ? "true" : undefined}
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-bold transition ${
                    isActive
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink"
                  }`}
                >
                  <Icon
                    className={`size-4 ${isActive ? "text-brand-400" : "text-brand-600"}`}
                    aria-hidden="true"
                  />
                  {label}
                </a>
              );
            })}
          </div>
        </nav>

        {children}
      </div>
    </div>
  );
}
