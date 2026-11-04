import { useState } from "react";
import { useRouter } from "next/router";
import { Accordion, Badge, Breadcrumbs, Button, Container, Gallery, Modal, OptionGroup, Price, QuantityInput, Table, ToastAnchor, useLabel, useToast } from "@myproject/core";
import { useCart } from "../../components/CartStore";
import { PageMeta } from "../../components/PageMeta";
import { SiteFrame } from "../../components/SiteFrame";
import { useSite } from "../../components/SiteContext";
import { getProductPage, getSite, withScope, type StoreProduct } from "../../lib/contentstack";
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
  const site = useSite();
  const { show } = useToast();
  const { addItem } = useCart();
  const initial = product.swatches.find((swatch) => swatch.value === color)?.value || product.swatches[0]?.value || "";
  const [selected, setSelected] = useState(initial);
  const [qty, setQty] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const colors = product.swatches.map((swatch) => ({ value: swatch.value, label: swatch.label, swatch: swatch.value }));

  const chosen = product.swatches.find((swatch) => swatch.value === selected);
  const film = product.images.find((image) => image.video);
  const stills = chosen?.image
    ? [{ src: chosen.image, alt: chosen.alt || product.alt }]
    : product.images.filter((image) => !image.video);
  const images = film ? [...stills, film] : stills;
  const colorLabel = useLabel("color", "Color");
  const addToBagLabel = useLabel("addToBag", "Add to bag");
  const wishlistLabel = useLabel("addToWishlist", "Add to wishlist");
  const wishlistSaved = useLabel("wishlistSaved", "Saved to your wishlist.");
  const detailsTitle = useLabel("productDetails", "Product details");
  const shippingTitle = useLabel("shippingReturns", "Shipping & returns");
  const shippingNote = useLabel("shippingNote", "Standard shipping arrives in 3 to 7 business days. Most items can be returned within 60 days.");
  const viewBag = useLabel("viewBag", "View bag");
  const addedTemplate = useLabel("added", "Added {count} {title} to your bag.");
  const bagFullTemplate = useLabel("bagFull", "Your bag already has 10 {title}.");
  const imagesLabel = useLabel("productImages", "{title} images", { title: product.title });
  const fillLabel = (template: string, values: Record<string, string | number>) =>
    template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));

  const addToBag = () => {
    const added = addItem({
      id: product.id,
      title: product.title,
      href: withScope(product.href, { site: site.key, locale: site.locale }),
      image: chosen?.image || product.image,
      alt: chosen?.alt || product.alt,
      price: product.price,
      ...(product.compareAt ? { compareAt: product.compareAt } : {}),
      ...(selected ? { color: selected } : {}),
    }, qty);
    if (added === 0) {
      show({ slot: "bag", tone: "info", duration: 4000, message: fillLabel(bagFullTemplate, { title: product.title }) });
      return;
    }
    show({
      slot: "bag",
      tone: "success",
      duration: 4000,
      message: fillLabel(addedTemplate, { count: added, title: product.title }),
      action: { label: viewBag, onClick: () => router.push(withScope("/cart", { site: site.key, locale: site.locale })) },
    });
  };

  return (
    <SiteFrame current={department} showBanner={false}>
      <PageMeta title={product.title} description={product.alt} site={site.name} />
      <main id="main">
        <Container>
          <div className={styles.product}>
            <Gallery key={`${product.id}:${selected}`} label={imagesLabel} images={images} />
            <div className={styles.buy}>
              <Breadcrumbs items={crumbs} />
              {product.badge && <Badge tone={product.badge === "New" ? "info" : "sale"}>{product.badge}</Badge>}
              <h1>{product.title}</h1>
              <Price value={product.price} compareAt={product.compareAt} locale={site.locale} />
              {colors.length > 0 && (
                <OptionGroup legend={colorLabel} options={colors} value={selected} onChange={setSelected} />
              )}
              {product.sizeGuide && (
                <Button variant="tertiary" className={styles.sizeGuide} onClick={() => setGuideOpen(true)}>
                  {product.sizeGuide.action}
                </Button>
              )}
              <QuantityInput value={qty} onChange={setQty} min={1} max={10} />
              <div className={styles.actions}>
                <Button fullWidth onClick={addToBag}>{addToBagLabel}</Button>
                <Button variant="tertiary" onClick={() => show({ tone: "info", message: wishlistSaved })}>{wishlistLabel}</Button>
              </div>
              <Accordion
                defaultValue={["details"]}
                items={[
                  {
                    id: "details",
                    title: detailsTitle,
                    content: <p>{product.alt}</p>,
                  },
                  {
                    id: "shipping",
                    title: shippingTitle,
                    content: <p>{shippingNote}</p>,
                  },
                ]}
              />
              <ToastAnchor id="bag" />
            </div>
          </div>
        </Container>
        {product.sizeGuide && (
          <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title={product.sizeGuide.title} description={product.sizeGuide.note} size="lg">
            <Table
              caption={product.sizeGuide.title}
              hideCaption
              columns={product.sizeGuide.columns.map((header, index) => ({
                key: String(index),
                header,
                cell: (row: string[]) => row[index] || "",
                ...(index === 0 ? { rowHeader: true } : {}),
              }))}
              rows={product.sizeGuide.rows}
              getRowKey={(row) => row.join("|")}
            />
          </Modal>
        )}
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
