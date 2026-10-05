import * as React from "react";
import { cx } from "../../utils/cx";
import s from "./Gallery.module.scss";

export interface GalleryImage {
  src: string;
  alt: string;
  thumbnail?: string;
}

export interface GalleryProps {
  /** Names the thumbnail group, e.g. "Product images". */
  label: string;
  images: GalleryImage[];
  aspectRatio?: string;
  className?: string;
}

/**
 * Product-image gallery: a main image with thumbnail buttons.
 * Thumbnails are a toolbar-like group using aria-pressed so state is announced.
 */
export function Gallery({ label, images, aspectRatio = "4/5", className }: GalleryProps) {
  const [active, setActive] = React.useState(0);
  const thumbs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const map: Record<string, number> = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: images.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const next = (map[e.key] + images.length) % images.length;
    thumbs.current[next]?.focus();
  };

  const current = images[active];
  return (
    <div className={cx(s.gallery, className)}>
      <div className={s.main} style={{ aspectRatio }}>
        <img src={current.src} alt={current.alt} className={s.mainImg} />
        <p className="visually-hidden" aria-live="polite">
          {`Image ${active + 1} of ${images.length}`}
        </p>
      </div>
      <div role="group" aria-label={label} className={s.thumbs}>
        {images.map((img, i) => (
          <button
            key={img.src}
            ref={(el) => { thumbs.current[i] = el; }}
            type="button"
            className={s.thumb}
            aria-pressed={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <img src={img.thumbnail ?? img.src} alt={img.alt} />
          </button>
        ))}
      </div>
    </div>
  );
}
