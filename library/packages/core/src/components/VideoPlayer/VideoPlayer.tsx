import * as React from "react";
import { IconPause, IconPlay } from "@myproject/icons";
import { cx } from "../../utils/cx";
import s from "./VideoPlayer.module.scss";

export interface VideoTrack {
  src: string;
  srcLang: string;
  label: string;
  kind?: "captions" | "subtitles" | "descriptions";
  default?: boolean;
}

interface BaseProps {
  src: string;
  poster?: string;
  /** Accessible name for the player region. */
  title: string;
  aspectRatio?: string;
  className?: string;
}

export interface InlineVideoProps extends BaseProps, Omit<React.VideoHTMLAttributes<HTMLVideoElement>, "src" | "poster" | "title"> {
  /** Standard player with native controls. Captions are required for content with speech (WCAG 1.2.2). */
  variant?: "inline";
  tracks?: VideoTrack[];
  /** Link to a text transcript (WCAG 1.2.1 / 1.2.3). */
  transcriptHref?: string;
}

export interface AmbientVideoProps extends BaseProps {
  /**
   * Muted, looping background video with a visible pause control (WCAG 2.2.2).
   * Doesn't autoplay when the user prefers reduced motion.
   */
  variant: "ambient";
  /** Text or content layered on top of the video. */
  children?: React.ReactNode;
}

export type VideoPlayerProps = InlineVideoProps | AmbientVideoProps;

export function VideoPlayer(props: VideoPlayerProps) {
  return props.variant === "ambient" ? <AmbientVideo {...props} /> : <InlineVideo {...props} />;
}

function InlineVideo({ src, poster, title, aspectRatio = "16/9", className, tracks = [], transcriptHref, variant: _v, controls = true, ...rest }: InlineVideoProps) {
  return (
    <figure className={cx(s.player, className)} aria-label={title} role="group">
      <video
        src={src}
        poster={poster}
        controls={controls}
        playsInline
        preload="metadata"
        className={s.video}
        style={{ aspectRatio }}
        {...rest}
      >
        {tracks.map((t) => (
          <track key={t.src} src={t.src} srcLang={t.srcLang} label={t.label} kind={t.kind ?? "captions"} default={t.default} />
        ))}
      </video>
      {transcriptHref && (
        <figcaption className={s.meta}>
          <a href={transcriptHref}>Read the transcript<span className="visually-hidden"> for {title}</span></a>
        </figcaption>
      )}
    </figure>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

function AmbientVideo({ src, poster, title, aspectRatio = "16/9", className, children }: AmbientVideoProps) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced) {
      v.pause();
      setPlaying(false);
    } else {
      v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [reduced]);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => undefined);
    else { v.pause(); setPlaying(false); }
  };

  return (
    <section className={cx(s.ambient, className)} aria-label={title} style={{ aspectRatio }}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} className={s.video} />
      {children && <div className={s.overlay}>{children}</div>}
      <button type="button" className={s.control} onClick={toggle} aria-pressed={!playing}>
        {playing ? <IconPause size="sm" /> : <IconPlay size="sm" />}
        <span className="visually-hidden">Pause background video</span>
      </button>
    </section>
  );
}
