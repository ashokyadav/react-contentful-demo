import { Container, Grid } from "../Layout/Layout";
import { ProductTile, type ProductTileProduct } from "../ProductTile/ProductTile";
import s from "./ProductRow.module.scss";

export interface ProductRowProps {
  id: string;
  label: string;
  products: ProductTileProduct[];
}

function filledColumns(count: number) {
  const lg = [6, 5, 4, 3, 2, 1].find((size) => count % size === 0) || 1;
  const md = [3, 2, 1].find((size) => size <= lg && count % size === 0) || 1;
  const base = [2, 1].find((size) => size <= md && count % size === 0) || 1;
  return { base, md, lg };
}

/** A labeled row of product cards. */
export function ProductRow({ id, label, products }: ProductRowProps) {
  return (
    <Container size="xl">
      <section id={id} className={s.row} aria-label={label}>
        <Grid columns={filledColumns(products.length)} gap="md">
          {products.map((product) => (
            <ProductTile key={`${product.href}-${product.title}`} product={product} />
          ))}
        </Grid>
      </section>
    </Container>
  );
}
