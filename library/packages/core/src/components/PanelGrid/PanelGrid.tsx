import * as React from "react";
import { cx } from "../../utils/cx";
import { Button } from "../Button/Button";
import { Image } from "../Image/Image";
import { Grid } from "../Layout/Layout";
import s from "./PanelGrid.module.scss";

export interface PanelGridItem {
  id: string;
  title: string;
  text?: string;
  image: string;
  alt: string;
  action: { label: string; href: string };
}

export interface PanelGridProps {
  panels: PanelGridItem[];
  /** Called with the action href. The homepage uses this for in-page links and routes. */
  onNavigate?: (href: string) => void;
  className?: string;
}

/**
 * Full-bleed promo tiles: a photo with a title, optional line, and action.
 * One column on small screens and two from 768px up.
 */
export function PanelGrid({ panels, onNavigate, className }: PanelGridProps) {
  const open = (href: string) => {
    if (onNavigate) onNavigate(href);
    else window.location.assign(href);
  };
  return (
    <Grid className={cx(s.grid, className)} columns={{ base: 1, md: 2 }} gap="none">
      {panels.map((panel) => (
        <article key={panel.id} id={panel.id} className={s.tile}>
          <Image src={panel.image} alt={panel.alt} fit="cover" />
          <div className={s.copy}>
            <h2>{panel.title}</h2>
            {panel.text && <p>{panel.text}</p>}
            <Button variant="secondary" className={s.action} onClick={() => open(panel.action.href)}>
              {panel.action.label}
            </Button>
          </div>
        </article>
      ))}
    </Grid>
  );
}
