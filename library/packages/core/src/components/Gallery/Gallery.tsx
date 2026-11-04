import * as React from "react";
import { IconPlay, IconSearch } from "@myproject/icons";
import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";
import { useLabel } from "../Labels/Labels";
import { Modal } from "../Modal/Modal";
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
 * Moving over a photo magnifies it. Zoom opens a closer view.
 * Thumbnails are a toolbar-like group using aria-pressed so state is announced.
 */
export function Gallery({ label, images, aspectRatio = "4/5", className }: GalleryProps) {
  const imageOf = useLabel("imageOf", "Image {current} of {total}");
  const videoOf = useLabel("videoOf", "Video {current} of {total}");
  const zoomImage = useLabel("zoomImage", "Zoom {name}");
  const [active, setActive] = React.useState(0);
  const [zoomOpen, setZoomOpen] = React.useState(false);
  const thumbs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const photoRef = React.useRef<HTMLImageElement>(null);

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
  const zoomName = zoomImage.replace("{name}", current?.alt ?? "");

  React.useEffect(() => {
    setZoomOpen(false);
    clearMagnify(photoRef.current);
  }, [active]);

  const trackZoom = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canTrackZoom()) return;
    magnifyAt(photoRef.current, event.currentTarget, event.clientX, event.clientY, 2);
  };

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
          <>
            <div
              className={s.stage}
              onMouseMove={trackZoom}
              onMouseLeave={() => clearMagnify(photoRef.current)}
              onClick={() => { clearMagnify(photoRef.current); setZoomOpen(true); }}
            >
              <img ref={photoRef} src={current?.src} alt={current?.alt ?? ""} className={s.mainImg} />
            </div>
            <button type="button" className={s.zoom} onClick={() => { clearMagnify(photoRef.current); setZoomOpen(true); }}>
              <IconSearch size="sm" />
              <span className="visually-hidden">{zoomName}</span>
            </button>
          </>
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
      {current && !current.video && (
        <Modal open={zoomOpen} onClose={() => setZoomOpen(false)} title={zoomName} size="lg">
          <ZoomView key={current.src} src={current.src} alt={current.alt} />
        </Modal>
      )}
    </div>
  );
}

function canTrackZoom() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function clearMagnify(photo: HTMLImageElement | null) {
  if (!photo) return;
  photo.style.transform = "";
  photo.style.transformOrigin = "";
}

function magnifyAt(photo: HTMLImageElement | null, frame: HTMLElement, clientX: number, clientY: number, scale: number) {
  if (!photo) return;
  const rect = frame.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  photo.style.transformOrigin = `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
  photo.style.transform = `scale(${scale})`;
}

function ZoomView({ src, alt }: { src: string; alt: string }) {
  const zoomIn = useLabel("zoomIn", "Zoom in");
  const zoomOut = useLabel("zoomOut", "Zoom out");
  const photoRef = React.useRef<HTMLImageElement>(null);
  const [magnified, setMagnified] = React.useState(false);

  React.useEffect(() => {
    const photo = photoRef.current;
    if (!photo) return;
    if (!magnified) {
      clearMagnify(photo);
      return;
    }
    photo.style.transformOrigin = "50% 50%";
    photo.style.transform = "scale(2)";
  }, [magnified]);

  const track = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!magnified || !canTrackZoom()) return;
    magnifyAt(photoRef.current, event.currentTarget, event.clientX, event.clientY, 2);
  };

  return (
    <div>
      <div className={cx(s.viewer, magnified && s.viewerMagnified)} onMouseMove={track} onClick={() => setMagnified((value) => !value)}>
        <img ref={photoRef} src={src} alt={alt} />
      </div>
      <div className={s.viewerActions}>
        <Button variant="secondary" size="sm" aria-pressed={magnified} onClick={() => setMagnified((value) => !value)}>
          {magnified ? zoomOut : zoomIn}
        </Button>
      </div>
    </div>
  );
}
