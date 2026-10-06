import * as React from "react";
import { IconChevronLeft, IconChevronRight, IconPause, IconPlay } from "@myproject/icons";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import s from "./Carousel.module.scss";

export interface CarouselProps {
  /** Accessible name, e.g. "Featured products". */
  label: string;
  children: React.ReactNode[];
  /** How many slides to show at once on a wide layout. Narrow widths show fewer. */
  visibleCount?: number;
  /** Auto-rotation (ms). Off by default; when on, a pause control is shown and rotation stops on hover/focus. */
  autoPlayInterval?: number;
  loop?: boolean;
  className?: string;
}

function fitVisibleCount(requested: number, width: number) {
  const wide = width >= 960 ? requested : width >= 640 ? Math.min(requested, 3) : 1;
  return Math.max(1, wide);
}

/** WAI-ARIA APG carousel pattern with previous/next buttons and slide picker. */
export function Carousel({ label, children, visibleCount = 5, autoPlayInterval, loop = true, className }: CarouselProps) {
  const slides = React.Children.toArray(children);
  const count = slides.length;
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(Boolean(autoPlayInterval));
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const [pageSize, setPageSize] = React.useState(Math.max(1, Math.min(visibleCount, count || 1)));
  const id = React.useId();
  const rootRef = React.useRef<HTMLElement>(null);
  const slideRefs = React.useRef<Array<HTMLDivElement | null>>([]);
  const maxIndex = Math.max(0, count - pageSize);

  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const apply = (width: number) => {
      setPageSize(Math.max(1, Math.min(fitVisibleCount(visibleCount, width), count || 1)));
    };
    apply(el.clientWidth);
    const observer = new ResizeObserver((entries) => apply(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleCount, count]);

  React.useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex));
  }, [maxIndex]);

  // `inert` keeps links/buttons in off-screen slides out of the tab order.
  // Set imperatively: React 18 doesn't render the attribute from props reliably.
  React.useEffect(() => {
    slideRefs.current.forEach((el, i) => el?.toggleAttribute("inert", i < index || i >= index + pageSize));
  }, [index, count, pageSize]);

  const go = React.useCallback(
    (next: number) => {
      const last = Math.max(0, count - pageSize);
      if (last === 0) return;
      if (loop) setIndex(((next % (last + 1)) + (last + 1)) % (last + 1));
      else setIndex(Math.max(0, Math.min(last, next)));
    },
    [count, loop, pageSize]
  );

  const rotating = playing && !hovered && !focused && maxIndex > 0;
  React.useEffect(() => {
    if (!autoPlayInterval || !rotating) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % (maxIndex + 1)), autoPlayInterval);
    return () => window.clearInterval(t);
  }, [autoPlayInterval, rotating, maxIndex]);

  const atStart = maxIndex === 0 || (!loop && index === 0);
  const atEnd = maxIndex === 0 || (!loop && index === maxIndex);
  const carouselLabel = useLabel("carousel", "carousel");
  const slideRole = useLabel("slideRole", "slide");
  const stopSlides = useLabel("stopSlides", "Stop automatic slide show");
  const startSlides = useLabel("startSlides", "Start automatic slide show");
  const previousSlide = useLabel("previousSlide", "Previous slide");
  const nextSlide = useLabel("nextSlide", "Next slide");
  const chooseSlide = useLabel("chooseSlide", "Choose slide");
  const slideOf = useLabel("slideOf", "{current} of {total}");
  const slideName = useLabel("slide", "Slide {n}");
  const text = (template: string, values: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ""));

  return (
    <section
      ref={rootRef}
      className={cx(s.carousel, className)}
      aria-roledescription={carouselLabel}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      <div className={s.controls}>
        {autoPlayInterval && (
          <button type="button" className={s.button} onClick={() => setPlaying((p) => !p)}>
            {playing ? <IconPause size="sm" /> : <IconPlay size="sm" />}
            <span className="visually-hidden">{playing ? stopSlides : startSlides}</span>
          </button>
        )}
        <button type="button" className={s.button} onClick={() => go(index - 1)} disabled={atStart} aria-controls={`${id}-slides`}>
          <IconChevronLeft size="sm" />
          <span className="visually-hidden">{previousSlide}</span>
        </button>
        <button type="button" className={s.button} onClick={() => go(index + 1)} disabled={atEnd} aria-controls={`${id}-slides`}>
          <IconChevronRight size="sm" />
          <span className="visually-hidden">{nextSlide}</span>
        </button>
      </div>

      {/* Announce slide changes only when the user drives them, not during auto-rotation. */}
      <div id={`${id}-slides`} className={s.viewport} aria-live={rotating ? "off" : "polite"}>
        <div className={s.track} style={{ transform: `translateX(-${index * (100 / pageSize)}%)` }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              className={s.slide}
              style={{ flexBasis: `${100 / pageSize}%` }}
              role="group"
              aria-roledescription={slideRole}
              aria-label={text(slideOf, { current: i + 1, total: count })}
              aria-hidden={i < index || i >= index + pageSize}
              ref={(el) => { slideRefs.current[i] = el; }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className={s.picker} role="group" aria-label={chooseSlide}>
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={s.dot}
            aria-current={i === index ? "true" : undefined}
            aria-controls={`${id}-slides`}
            onClick={() => go(i)}
          >
            <span className="visually-hidden">{text(slideName, { n: i + 1 })}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
