import { useEffect, useState } from "react";
import { PageMeta } from "../../components/PageMeta";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  Image,
  List,
  ListItem,
  Price,
  Stepper,
} from "@myproject/core";
import { IconBag } from "@myproject/icons";
import { useCart } from "../../components/CartStore";
import { useFooter } from "../../components/FooterContent";
import { useSite } from "../../components/SiteContext";
import { checkoutStepsFor, fill, getCheckout, getSite, withScope, type StoreCheckout } from "../../lib/contentstack";
import { placeOrder, readCheckout, writeOrder, type CheckoutAddress, type CheckoutDraft } from "../../lib/checkoutDraft";
import { persistScope, scopeFor, scopeFrom } from "../../lib/scope";
import styles from "../../styles/shipping.module.scss";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function placeName(options: { value: string; label: string }[], value: string) {
  return options.find((option) => option.value === value)?.label || value;
}

function formatAddress(address: CheckoutAddress, checkout: StoreCheckout) {
  const region = placeName(checkout.regions, address.region);
  const country = placeName(checkout.countries, address.country);
  const street = [address.line1, address.line2].filter(Boolean).join(", ");
  return `${address.first} ${address.last}, ${street}, ${address.city}, ${region} ${address.zip}, ${country}`;
}

export default function ReviewPage({ checkout }: { checkout: StoreCheckout }) {
  const router = useRouter();
  const { lines, clear } = useCart();
  const footer = useFooter();
  const site = useSite();
  const scoped = (href: string) => withScope(href, { site: site.key, locale: site.locale });
  const [draft, setDraft] = useState<CheckoutDraft>({});
  const [placing, setPlacing] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = checkout.methods.find((option) => option.id === draft.method) ?? checkout.methods[0];
  const payment = checkout.payments.find((option) => option.id === draft.pay);
  const billing = draft.billingSame === false && draft.billing ? draft.billing : draft.address;
  const ready = Boolean(draft.address && draft.email && draft.pay) && count > 0;

  useEffect(() => {
    setDraft(readCheckout());
  }, []);

  return (
    <>
      <PageMeta title={checkout.reviewTitle} description={checkout.reviewAlertBody} site={site.name} />
      <div className={styles.shell}>
        <header className={styles.header}>
          <a href={scoped("/")} className={styles.wordmark}>{site.name}</a>
          <Stepper current={2} steps={checkoutStepsFor(checkout, 2).map((step) => (step.href ? { ...step, href: scoped(step.href) } : step))} />
          <a href={scoped("/cart")} className={styles.back}>{checkout.backToBag} <IconBag size="sm" /></a>
        </header>

        <main id="main" className={styles.main}>
          <div>
            <h1 className="visually-hidden">{checkout.reviewTitle}</h1>
            <Alert tone="info" title={checkout.reviewAlertTitle}>
              <p>{checkout.reviewAlertBody}</p>
            </Alert>

            <section className={styles.section} aria-labelledby="ship-heading">
              <div className={styles.sectionHead}>
                <h2 id="ship-heading">{checkout.shippingHeading}</h2>
                <Button variant="tertiary" onClick={() => { window.location.assign("/checkout/shipping"); }}>{checkout.edit}</Button>
              </div>
              {draft.address ? (
                <List variant="plain" spacing="sm">
                  <ListItem description={formatAddress(draft.address, checkout)}>{checkout.shipTo}</ListItem>
                  <ListItem description={shipping?.detail} suffix={money(shipping?.price ?? 0)}>{shipping?.label}</ListItem>
                  {draft.giftNote && draft.giftMessage ? <ListItem description={draft.giftMessage}>{checkout.giftMessage}</ListItem> : null}
                </List>
              ) : <p>{checkout.addAddress}</p>}
            </section>

            <section className={styles.section} aria-labelledby="bill-heading">
              <div className={styles.sectionHead}>
                <h2 id="bill-heading">{checkout.billingHeading}</h2>
                <Button variant="tertiary" onClick={() => { window.location.assign("/checkout/billing"); }}>{checkout.edit}</Button>
              </div>
              {draft.pay ? (
                <List variant="plain" spacing="sm">
                  <ListItem description={draft.email}>{checkout.email}</ListItem>
                  <ListItem description={draft.pay === "card" && draft.cardLast4 ? `${draft.cardName} ${draft.cardLast4}` : draft.paypalOrderId || payment?.detail}>
                    {payment?.label || checkout.payment}
                  </ListItem>
                  {billing ? <ListItem description={formatAddress(billing, checkout)}>{checkout.billTo}</ListItem> : null}
                </List>
              ) : <p>{checkout.addPayment}</p>}
            </section>

            <section className={styles.section} aria-labelledby="items-heading">
              <h2 id="items-heading">{fill(checkout.itemsHeading, { count })}</h2>
              {lines.length > 0 ? lines.map((line) => (
                <article key={`${line.id}:${line.color ?? ""}`} className={styles.line}>
                  <a href={scoped(line.href)} className={styles.thumb}>
                    <Image src={line.image} alt={line.alt} aspectRatio="3/4" />
                  </a>
                  <div>
                    <h3><a href={scoped(line.href)}>{line.title}</a></h3>
                    <Price value={line.price} compareAt={line.compareAt} />
                    <p className={styles.meta}>{fill(checkout.qty, { count: line.quantity })}</p>
                    <p className={styles.stock}>{checkout.inStock}</p>
                  </div>
                </article>
              )) : <p>{checkout.emptyBag}</p>}
            </section>
          </div>

          <aside>
            <div className={styles.summary} aria-label={checkout.summary}>
              <h2>{checkout.summary}</h2>
              <dl className={styles.totals}>
                <div><dt>{checkout.subtotal}</dt><dd>{money(subtotal)}</dd></div>
                <div><dt>{checkout.shippingLabel}</dt><dd>{money(shipping?.price ?? 0)}</dd></div>
                <div><dt>{checkout.tax}</dt><dd>—</dd></div>
                <div className={styles.total}><dt>{checkout.estimatedTotal}</dt><dd>{money(subtotal + (shipping?.price ?? 0))}</dd></div>
              </dl>
              {saveFailed && (
                <Alert tone="info" title={checkout.needHelp}>
                  <p>{checkout.help}</p>
                </Alert>
              )}
              <Button
                fullWidth
                disabled={!ready}
                loading={placing}
                onClick={async () => {
                  if (!draft.address || !draft.email || !draft.pay || !shipping) return;
                  const billed = draft.billingSame === false && draft.billing ? draft.billing : draft.address;
                  setPlacing(true);
                  setSaveFailed(false);
                  const result = await placeOrder(site.key, {
                    number: String(Date.now()).slice(-8),
                    lines: lines.map((line) => ({
                      id: line.id,
                      title: line.title,
                      href: line.href,
                      image: line.image,
                      alt: line.alt,
                      price: line.price,
                      compareAt: line.compareAt,
                      color: line.color,
                      quantity: line.quantity,
                    })),
                    address: draft.address,
                    method: draft.method || shipping.id,
                    email: draft.email,
                    pay: draft.pay,
                    cardName: draft.pay === "card" ? draft.cardName : undefined,
                    cardLast4: draft.pay === "card" ? draft.cardLast4 : undefined,
                    billing: billed,
                    giftMessage: draft.giftNote ? draft.giftMessage : undefined,
                    paypalOrderId: draft.pay === "paypal" ? draft.paypalOrderId : undefined,
                  });
                  if (!result.ok) {
                    setPlacing(false);
                    setSaveFailed(true);
                    return;
                  }
                  writeOrder(result.order);
                  clear();
                  router.push(scoped("/checkout/confirmation"));
                }}
              >
                {checkout.placeOrder}
              </Button>
              <p className={styles.installment}>{checkout.installment}</p>
            </div>
            <div className={styles.help}>
              <h2>{checkout.needHelp}</h2>
              <p>{checkout.help}</p>
            </div>
          </aside>
        </main>

        <footer className={styles.footer}>
          {footer.copyright && <p>{footer.copyright}</p>}
          {footer.legal.length > 0 && (
            <p>
              {footer.legal.map((link) => (
                <a key={link.label} href={link.href}>{link.label}</a>
              ))}
            </p>
          )}
        </footer>
      </div>
    </>
  );
}

export async function getServerSideProps(ctx: Parameters<typeof scopeFrom>[0]) {
  const scope = scopeFrom(ctx);
  const site = await getSite(scope);
  const content = scopeFor(scope, site);
  persistScope(ctx, content);
  const checkout = await getCheckout(content);
  if (!checkout) return { notFound: true };
  return { props: { checkout } };
}
