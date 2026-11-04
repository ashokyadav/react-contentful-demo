import * as React from "react";
import { IconPlay } from "@myproject/icons";
import { cx } from "../../utils/cx";
import { useLabel } from "../Labels/Labels";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import s from "./Gallery.module.scss";

export interface GalleryImage {
  src: string;
  alt: string;
  thumbnail?: string;
  /** When set, this slide plays a video and `src` is its poster. */
  video?: string;
}

export interface GalleryProps {
  /** Names the thumbnail group, e.g. "Product images". */
  label: string;
  images: GalleryImage[];
  aspectRatio?: string;
  className?: string;
}

/**
 * Product gallery: a main image with thumbnail buttons. A slide with `video`
 * plays that film in the main frame and keeps `src` as the poster.
 * Thumbnails are a toolbar-like group using aria-pressed so state is announced.
 */
export function Gallery({ label, images, aspectRatio = "4/5", className }: GalleryProps) {
  const imageOf = useLabel("imageOf", "Image {current} of {total}");
  const videoOf = useLabel("videoOf", "Video {current} of {total}");
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
  const position = (current?.video ? videoOf : imageOf)
    .replace("{current}", String(active + 1))
    .replace("{total}", String(images.length));
  return (
    <div className={cx(s.gallery, className)}>
      <div className={s.main} style={{ aspectRatio }}>
        {current?.video ? (
          <VideoPlayer
            key={current.video}
            variant="inline"
            src={current.video}
            poster={current.src}
            title={current.alt}
            aspectRatio={aspectRatio}
            className={s.player}
          />
        ) : (
          <img src={current?.src} alt={current?.alt ?? ""} className={s.mainImg} />
        )}
        <p className="visually-hidden" aria-live="polite">{position}</p>
      </div>
      <div role="group" aria-label={label} className={s.thumbs}>
        {images.map((img, i) => (
          <button
            key={`${i}:${img.video ?? img.src}`}
            ref={(el) => { thumbs.current[i] = el; }}
            type="button"
            className={s.thumb}
            aria-pressed={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <img src={img.thumbnail ?? img.src} alt={img.alt} />
            {img.video && (
              <span className={s.play} aria-hidden="true">
                <IconPlay size="sm" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
