import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Accordion, Badge, Breadcrumbs, Button, Container, Gallery, OptionGroup, Price, QuantityInput, useToast } from "@myproject/core";
import { useCart } from "../../components/CartStore";
import { SiteFrame } from "../../components/SiteFrame";
import { getProductPage, getSite, type StoreProduct } from "../../lib/contentstack";
import { persistScope, scopeFor, scopeFrom } from "../../lib/scope";
import styles from "../../styles/home.module.scss";

type ProductPageProps = {
  product: StoreProduct;
  department: string;
  crumbs: { label: string; href?: string }[];
  color: string;
};

export default function ProductPage({ product, department, crumbs, color }: ProductPageProps) {
  const router = useRouter();
  const { show } = useToast();
  const { addItem } = useCart();
  const initial = product.swatches.find((swatch) => swatch.value === color)?.value || product.swatches[0]?.value || "";
  const [selected, setSelected] = useState(initial);
  const [qty, setQty] = useState(1);
  const colors = product.swatches.map((swatch) => ({ value: swatch.value, label: swatch.label, swatch: swatch.value }));

  const chosen = product.swatches.find((swatch) => swatch.value === selected);
  const images = chosen?.image ? [{ src: chosen.image, alt: chosen.alt || product.alt }] : product.images;

  const addToBag = () => {
    const added = addItem({
      id: product.id,
      title: product.title,
      href: product.href,
      image: chosen?.image || product.image,
      alt: chosen?.alt || product.alt,
      price: product.price,
      ...(product.compareAt ? { compareAt: product.compareAt } : {}),
      ...(selected ? { color: selected } : {}),
    }, qty);
    if (added === 0) {
      show({ tone: "info", message: `Your bag already has 10 ${product.title}.` });
      return;
    }
    show({
      tone: "success",
      message: `Added ${added} ${product.title} to your bag.`,
      action: { label: "View bag", onClick: () => router.push("/cart") },
    });
  };

  return (
    <SiteFrame current={department} showBanner={false}>
      <Head>
        <title>{product.title}</title>
      </Head>
      <main id="main">
        <Container>
          <div className={styles.product}>
            <Gallery key={`${product.id}:${selected}`} label={`${product.title} images`} images={images} />
            <div className={styles.buy}>
              <Breadcrumbs items={crumbs} />
              {product.badge && <Badge tone={product.badge === "New" ? "info" : "sale"}>{product.badge}</Badge>}
              <h1>{product.title}</h1>
              <Price value={product.price} compareAt={product.compareAt} />
              {colors.length > 0 && (
                <OptionGroup legend="Color" options={colors} value={selected} onChange={setSelected} />
              )}
              <QuantityInput value={qty} onChange={setQty} min={1} max={10} />
              <div className={styles.actions}>
                <Button fullWidth onClick={addToBag}>Add to bag</Button>
                <Button variant="tertiary" onClick={() => show({ tone: "info", message: "Saved to your wishlist." })}>Add to wishlist</Button>
              </div>
              <Accordion
                defaultValue={["details"]}
                items={[
                  {
                    id: "details",
                    title: "Product details",
                    content: <p>{product.alt}</p>,
                  },
                  {
                    id: "shipping",
                    title: "Shipping & returns",
                    content: <p>Standard shipping arrives in 3 to 7 business days. Most items can be returned within 60 days.</p>,
                  },
                ]}
              />
            </div>
          </div>
        </Container>
      </main>
    </SiteFrame>
  );
}

export async function getServerSideProps(ctx: { params?: { slug?: string }; query?: { color?: string | string[] } }) {
  const slug = ctx.params?.slug;
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) return { notFound: true };
  const scope = scopeFrom(ctx);
  const site = await getSite(scope);
  const content = scopeFor(scope, site);
  persistScope(ctx, content);
  const page = await getProductPage(slug, content);
  if (!page) return { notFound: true };
  const requested = typeof ctx.query?.color === "string" ? ctx.query.color : "";
  return { props: { ...page, color: requested } };
}
