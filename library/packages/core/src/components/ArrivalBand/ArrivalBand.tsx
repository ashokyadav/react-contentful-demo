import * as React from "react";
import { Button } from "../Button/Button";
import { Container } from "../Layout/Layout";
import { ProductTile, type ProductTileProduct } from "../ProductTile/ProductTile";
import s from "./ArrivalBand.module.scss";

export interface ArrivalBandProps {
  id: string;
  title: string;
  text: string;
  action: { label: string; href: string };
  products: ProductTileProduct[];
  onNavigate?: (href: string) => void;
}

/** Dark band with an intro and a row of product cards. */
export function ArrivalBand({ id, title, text, action, products, onNavigate }: ArrivalBandProps) {
  const headingId = `${id}-heading`;
  const open = (href: string) => {
    if (onNavigate) onNavigate(href);
    else window.location.assign(href);
  };
  return (
    <section id={id} className={s.band} aria-labelledby={headingId}>
      <Container size="xl">
        <div className={s.layout}>
          <div className={s.intro}>
            <h2 id={headingId}>{title}</h2>
            <p>{text}</p>
            <Button variant="secondary" className={s.action} onClick={() => open(action.href)}>
              {action.label}
            </Button>
          </div>
          <div className={s.products} style={{ "--arrival-count": products.length } as React.CSSProperties}>
            {products.map((product) => (
              <ProductTile key={product.href} product={product} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
