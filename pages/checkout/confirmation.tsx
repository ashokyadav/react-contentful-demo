import { useEffect, useState } from "react";
import { PageMeta } from "../../components/PageMeta";
import { Alert, Button, Image, List, ListItem, Price } from "@myproject/core";
import { useFooter } from "../../components/FooterContent";
import { useSite } from "../../components/SiteContext";
import { fill, getCheckout, getSite, withScope, type StoreCheckout } from "../../lib/contentstack";
import { readOrder, type CheckoutAddress, type PlacedOrder } from "../../lib/checkoutDraft";
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

export default function ConfirmationPage({ checkout }: { checkout: StoreCheckout }) {
  const footer = useFooter();
  const site = useSite();
  const scoped = (href: string) => withScope(href, { site: site.key, locale: site.locale });
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOrder(readOrder());
    setReady(true);
  }, []);

  const count = order?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0;
  const subtotal = order?.lines.reduce((sum, line) => sum + line.price * line.quantity, 0) ?? 0;
  const shipping = checkout.methods.find((option) => option.id === order?.method) ?? checkout.methods[0];
  const payment = checkout.payments.find((option) => option.id === order?.pay);

  return (
    <>
      <PageMeta title={checkout.confirmationTitle} description={order ? fill(checkout.confirmedBody, { email: order.email }) : checkout.noOrderBody} site={site.name} />
      <div className={styles.shell}>
        <header className={styles.header}>
          <a href={scoped("/")} className={styles.wordmark}>{site.name}</a>
          <h1 className={styles.title}>{checkout.thankYou}</h1>
          <a href={scoped("/")} className={styles.back}>{checkout.continueShopping}</a>
        </header>

        <main id="main" className={styles.main}>
          <div>
            {ready && !order && (
              <Alert tone="info" title={checkout.noOrderTitle}>
                <p>{checkout.noOrderBody}</p>
              </Alert>
            )}
            {order && (
              <>
                <Alert tone="success" title={fill(checkout.confirmedTitle, { number: order.number })}>
                  <p>{fill(checkout.confirmedBody, { email: order.email })}</p>
                </Alert>

                <section className={styles.section} aria-labelledby="ship-heading">
                  <div className={styles.sectionHead}>
                    <h2 id="ship-heading">{checkout.shippingHeading}</h2>
                  </div>
                  <List variant="plain" spacing="sm">
                    <ListItem description={formatAddress(order.address, checkout)}>{checkout.shipTo}</ListItem>
                    <ListItem description={shipping?.detail} suffix={money(shipping?.price ?? 0)}>{shipping?.label}</ListItem>
                    {order.giftMessage ? <ListItem description={order.giftMessage}>{checkout.giftMessage}</ListItem> : null}
                  </List>
                </section>

                <section className={styles.section} aria-labelledby="bill-heading">
                  <div className={styles.sectionHead}>
                    <h2 id="bill-heading">{checkout.billingHeading}</h2>
                  </div>
                  <List variant="plain" spacing="sm">
                    <ListItem description={order.email}>{checkout.email}</ListItem>
                    <ListItem description={order.pay === "card" && order.cardLast4 ? `${order.cardName} ${order.cardLast4}` : order.paypalOrderId || payment?.detail}>
                      {payment?.label || checkout.payment}
                    </ListItem>
                    {order.billing ? <ListItem description={formatAddress(order.billing, checkout)}>{checkout.billTo}</ListItem> : null}
                  </List>
                </section>

                <section className={styles.section} aria-labelledby="items-heading">
                  <div className={styles.sectionHead}>
                    <h2 id="items-heading">{fill(checkout.itemsWord, { count })}</h2>
                  </div>
                  {order.lines.map((line) => (
                    <article key={`${line.id}:${line.color ?? ""}`} className={styles.line}>
                      <a href={scoped(line.href)} className={styles.thumb}>
                        <Image src={line.image} alt={line.alt} aspectRatio="3/4" />
                      </a>
                      <div>
                        <h3><a href={scoped(line.href)}>{line.title}</a></h3>
                        <Price value={line.price} compareAt={line.compareAt} />
                        {line.color ? <p className={styles.meta}>{line.color}</p> : null}
                        <p className={styles.meta}>{fill(checkout.qty, { count: line.quantity })}</p>
                      </div>
                    </article>
                  ))}
                </section>
              </>
            )}
          </div>

          <aside>
            <div className={styles.summary} aria-label={checkout.summary}>
              <h2>{order ? fill(checkout.orderWord, { number: order.number }) : checkout.summary}</h2>
              {order ? (
                <dl className={styles.totals}>
                  <div><dt>{checkout.subtotal}</dt><dd>{money(subtotal)}</dd></div>
                  <div><dt>{checkout.shippingLabel}</dt><dd>{money(shipping?.price ?? 0)}</dd></div>
                  <div><dt>{checkout.tax}</dt><dd>—</dd></div>
                  <div className={styles.total}><dt>{checkout.totalLabel}</dt><dd>{money(subtotal + (shipping?.price ?? 0))}</dd></div>
                </dl>
              ) : <p>{checkout.noOrderAside}</p>}
              <Button fullWidth onClick={() => { window.location.assign("/"); }}>{checkout.continueShopping}</Button>
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
