import { Button } from "../Button/Button";
import { Grid } from "../Layout/Layout";
import { Image } from "../Image/Image";
import s from "./FeatureBand.module.scss";

export interface FeatureBandProps {
  id: string;
  title: string;
  text: string;
  action: { label: string; href: string };
  images: { src: string; alt: string }[];
  onNavigate?: (href: string) => void;
}

function filledColumns(count: number) {
  const lg = [6, 5, 4, 3, 2, 1].find((size) => count % size === 0) || 1;
  const md = [3, 2, 1].find((size) => size <= lg && count % size === 0) || 1;
  const base = [2, 1].find((size) => size <= md && count % size === 0) || 1;
  return { base, md, lg };
}

/** A photo strip with a heading and action centered over it. */
export function FeatureBand({ id, title, text, action, images, onNavigate }: FeatureBandProps) {
  const headingId = `${id}-heading`;
  const open = (href: string) => {
    if (onNavigate) onNavigate(href);
    else window.location.assign(href);
  };
  return (
    <section id={id} className={s.feature} aria-labelledby={headingId}>
      <Grid columns={filledColumns(images.length)} gap="none">
        {images.map((image) => (
          <Image key={image.alt} src={image.src} alt={image.alt} aspectRatio="3/4" />
        ))}
      </Grid>
      <div className={s.copy}>
        <h2 id={headingId}>{title}</h2>
        <p>{text}</p>
        <Button variant="secondary" className={s.action} onClick={() => open(action.href)}>
          {action.label}
        </Button>
      </div>
    </section>
  );
}
