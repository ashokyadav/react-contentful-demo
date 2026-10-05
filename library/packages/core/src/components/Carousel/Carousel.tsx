import * as React from "react";
import { IconChevronLeft, IconChevronRight, IconPause, IconPlay } from "@myproject/icons";
import { cx } from "../../utils/cx";
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

  return (
    <section
      ref={rootRef}
      className={cx(s.carousel, className)}
      aria-roledescription="carousel"
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
            <span className="visually-hidden">{playing ? "Stop automatic slide show" : "Start automatic slide show"}</span>
          </button>
        )}
        <button type="button" className={s.button} onClick={() => go(index - 1)} disabled={atStart} aria-controls={`${id}-slides`}>
          <IconChevronLeft size="sm" />
          <span className="visually-hidden">Previous slide</span>
        </button>
        <button type="button" className={s.button} onClick={() => go(index + 1)} disabled={atEnd} aria-controls={`${id}-slides`}>
          <IconChevronRight size="sm" />
          <span className="visually-hidden">Next slide</span>
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
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i < index || i >= index + pageSize}
              ref={(el) => { slideRefs.current[i] = el; }}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className={s.picker} role="group" aria-label="Choose slide">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            className={s.dot}
            aria-current={i === index ? "true" : undefined}
            aria-controls={`${id}-slides`}
            onClick={() => go(i)}
          >
            <span className="visually-hidden">Slide {i + 1}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
