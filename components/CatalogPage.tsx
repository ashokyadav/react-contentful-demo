import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Badge, Breadcrumbs, Button, Card, Container, Grid, Image, Pagination, Price, Select, SwatchPicker } from "@myproject/core";
import type { StoreCatalog, StoreProduct } from "../lib/contentstack";
import { fill } from "../lib/contentstack";
import { PageMeta } from "./PageMeta";
import { useSite } from "./SiteContext";
import { SiteFrame } from "./SiteFrame";
import styles from "../styles/catalog.module.scss";

function sortProducts(items: StoreProduct[], sort: string) {
  const next = [...items];
  if (sort === "newest") next.sort((a, b) => b.newest - a.newest);
  if (sort === "price-asc") next.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") next.sort((a, b) => b.price - a.price);
  return next;
}

function withColor(href: string, color: string) {
  if (!color) return href;
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}color=${encodeURIComponent(color)}`;
}

function ProductCard({ product }: { product: StoreProduct }) {
  const [color, setColor] = useState(product.swatches[0]?.value || "");
  const selected = product.swatches.some((swatch) => swatch.value === color) ? color : product.swatches[0]?.value || "";
  const chosen = product.swatches.find((swatch) => swatch.value === selected);
  return (
    <Card
      className={styles.product}
      href={withColor(product.href, selected)}
      title={product.title}
      media={(
        <div className={styles.media}>
          {product.badge && <Badge tone={product.badge === "New" ? "info" : "sale"} className={styles.flag}>{product.badge}</Badge>}
          <Image src={chosen?.image || product.image} alt={chosen?.alt || product.alt} aspectRatio="3/4" />
        </div>
      )}
    >
      <Price value={product.price} compareAt={product.compareAt} />
      {product.swatches.length > 0 && (
        <SwatchPicker label={`${product.title} color`} options={product.swatches} value={selected} onChange={setColor} />
      )}
    </Card>
  );
}

export function CatalogPage({ catalog }: { catalog: StoreCatalog }) {
  const router = useRouter();
  const site = useSite();
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);
  const requested = typeof router.query.category === "string" ? router.query.category : "all";
  const category = catalog.categories.some((item) => item.id === requested) ? requested : "all";

  const products = useMemo(() => {
    const filtered = category === "all"
      ? catalog.products
      : catalog.products.filter((item) => item.category === category);
    return sortProducts(filtered, sort);
  }, [catalog.products, category, sort]);

  const totalPages = Math.max(1, Math.ceil(products.length / catalog.pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * catalog.pageSize;
  const visible = products.slice(start, start + catalog.pageSize);
  const showPromo = currentPage === 1 && catalog.promo.categories.includes(category) && Boolean(catalog.promo.title);
  const promoAt = Math.min(catalog.promoAfter, visible.length);

  const selectCategory = (id: string) => {
    setPage(1);
    const query = id === "all" ? {} : { category: id };
    router.push({ pathname: catalog.url, query }, undefined, { shallow: true });
  };

  return (
    <SiteFrame current={catalog.department}>
      <PageMeta title={catalog.title} description={catalog.lede} site={site.name} />
      <main id="main" className={styles.page}>
        <Container size="xl">
          <header className={styles.heading}>
            <Breadcrumbs items={catalog.crumbs} />
            <h1>{catalog.title}</h1>
            <p>{catalog.lede}</p>
          </header>

          <ul className={styles.categories}>
            {catalog.categories.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`${styles.category} ${item.id === category ? styles.categoryCurrent : ""}`}
                  aria-current={item.id === category ? "true" : undefined}
                  onClick={() => selectCategory(item.id)}
                >
                  {item.image ? (
                    item.alt ? <Image src={item.image} alt={item.alt} /> : <Image src={item.image} decorative />
                  ) : (
                    <span className={styles.allMark} aria-hidden="true">{item.label}</span>
                  )}
                  <span className={styles.categoryLabel}>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>

          <div id="results" className={styles.toolbar}>
            <p className={styles.count}>{fill(catalog.resultsLabel, { count: products.length })}</p>
            <Select
              className={styles.sort}
              label={catalog.sortLabel}
              value={sort}
              options={catalog.sorts}
              onChange={(event) => {
                setSort(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <Grid className={styles.grid} columns={{ base: 2, md: 3, lg: 4 }} gap="md">
            {visible.slice(0, promoAt).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {showPromo && (
              <article className={styles.promo}>
                <p>{catalog.promo.eyebrow}</p>
                <h2>{catalog.promo.title}</h2>
                <p className={styles.promoOffer}>{catalog.promo.offer}</p>
                <Button variant="secondary" onClick={() => router.push(catalog.promo.href)}>{catalog.promo.action}</Button>
              </article>
            )}
            {visible.slice(promoAt).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Grid>

          <div className={styles.pager}>
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(next) => {
                setPage(next);
                document.getElementById("results")?.scrollIntoView();
              }}
            />
          </div>

          <section className={styles.about} aria-labelledby="catalog-about">
            <h2 id="catalog-about">{catalog.about.title}</h2>
            <p>{catalog.about.text}</p>
          </section>
        </Container>
      </main>
    </SiteFrame>
  );
}
