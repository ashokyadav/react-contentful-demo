import * as React from "react";
import Head from "next/head";
import { cx } from "../../utils/cx";
import s from "./Image.module.scss";

type AltProps =
  | { alt: string; decorative?: false }
  /** Decorative images get alt="" and are skipped by screen readers. */
  | { alt?: never; decorative: true };

export type ImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "alt"> &
  AltProps & {
    /** e.g. "4/5" for product tiles. Reserves space to prevent layout shift (CLS). */
    aspectRatio?: string;
    fit?: "cover" | "contain";
    /** Above-the-fold: eager load, high fetch priority, and a <link rel="preload"> via next/head. */
    priority?: boolean;
    caption?: React.ReactNode;
  };

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(function Image(
  { alt, decorative, aspectRatio, fit = "cover", priority, caption, className, style, src, srcSet, sizes, ...rest },
  ref
) {
  const img = (
    <img
      ref={ref}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={decorative ? "" : alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // @ts-expect-error fetchpriority is valid HTML; React 18 types lag behind
      fetchpriority={priority ? "high" : undefined}
      className={cx(s.img, className)}
      style={{ aspectRatio, objectFit: fit, ...style }}
      {...rest}
    />
  );
  return (
    <>
      {priority && src && (
        <Head>
          <link rel="preload" as="image" href={src} imageSrcSet={srcSet} imageSizes={sizes} key={`preload-${src}`} />
        </Head>
      )}
      {caption ? (
        <figure className={s.figure}>
          {img}
          <figcaption className={s.caption}>{caption}</figcaption>
        </figure>
      ) : (
        img
      )}
    </>
  );
});
