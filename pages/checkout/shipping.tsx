import { useEffect, useState } from "react";
import { PageMeta } from "../../components/PageMeta";
import { useRouter } from "next/router";
import {
  Button,
  Checkbox,
  Form,
  Image,
  Price,
  Radio,
  RadioGroup,
  Select,
  Stepper,
  TextInput,
  useToast,
} from "@myproject/core";
import { IconBag } from "@myproject/icons";
import { useCart } from "../../components/CartStore";
import { PayPalButton } from "../../components/PayPalButton";
import { useFooter } from "../../components/FooterContent";
import { useSite } from "../../components/SiteContext";
import { checkoutStepsFor, fill, getCheckout, getSite, withScope, type StoreCheckout } from "../../lib/contentstack";
import { readCheckout, writeCheckout } from "../../lib/checkoutDraft";
import { persistScope, scopeFor, scopeFrom } from "../../lib/scope";
import styles from "../../styles/shipping.module.scss";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export default function ShippingPage({ checkout }: { checkout: StoreCheckout }) {
  const router = useRouter();
  const { show } = useToast();
  const [method, setMethod] = useState(checkout.methods[0]?.id || "");
  const [country, setCountry] = useState(checkout.countries[0]?.value || "");
  const [region, setRegion] = useState("");
  const [giftBox, setGiftBox] = useState(false);
  const [giftNote, setGiftNote] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [address, setAddress] = useState({ first: "", last: "", line1: "", line2: "", city: "", zip: "" });
  const { lines } = useCart();
  const footer = useFooter();
  const site = useSite();
  const scoped = (href: string) => withScope(href, { site: site.key, locale: site.locale });
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = checkout.methods.find((option) => option.id === method) ?? checkout.methods[0];
  const ready = [address.first, address.last, address.line1, address.city, address.zip, region].every((value) => value.trim().length > 0);
  const set = (key: keyof typeof address) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => {
    const draft = readCheckout();
    if (draft.method) setMethod(draft.method);
    if (draft.address) {
      setCountry(draft.address.country || checkout.countries[0]?.value || "");
      setRegion(draft.address.region);
      setAddress({
        first: draft.address.first,
        last: draft.address.last,
        line1: draft.address.line1,
        line2: draft.address.line2,
        city: draft.address.city,
        zip: draft.address.zip,
      });
    }
    if (draft.giftBox) setGiftBox(true);
    if (draft.giftNote) setGiftNote(true);
    if (draft.giftMessage) setGiftMessage(draft.giftMessage);
  }, []);

  return (
    <>
      <PageMeta title={checkout.steps[0]?.label || ""} description={checkout.help} site={site.name} />
      <div className={styles.shell}>
        <header className={styles.header}>
          <a href={scoped("/")} className={styles.wordmark}>{site.name}</a>
          <Stepper current={0} steps={checkoutStepsFor(checkout, 0).map((step) => (step.href ? { ...step, href: scoped(step.href) } : step))} />
          <a href={scoped("/cart")} className={styles.back}>{checkout.backToBag} <IconBag size="sm" /></a>
        </header>

        <main id="main" className={styles.main}>
          <div>
            <p className={styles.signIn}>
              {`${checkout.signInPrompt} `}
              <Button variant="tertiary" onClick={() => router.push(scoped("/account"))}>{checkout.signIn}</Button>
            </p>

            <h1 className="visually-hidden">{checkout.steps[0]?.label}</h1>
            <h2>{checkout.expressHeading}</h2>
            <div className={styles.express}>
              {count > 0 ? (
                <PayPalButton
                  layout="horizontal"
                  amount={(subtotal + (shipping?.price ?? 0)).toFixed(2)}
                  onApproved={(approval) => {
                    const next = approval.address || (ready ? { ...address, region, country } : undefined);
                    if (approval.address) {
                      setCountry(approval.address.country);
                      setRegion(approval.address.region);
                      setAddress({
                        first: approval.address.first,
                        last: approval.address.last,
                        line1: approval.address.line1,
                        line2: approval.address.line2,
                        city: approval.address.city,
                        zip: approval.address.zip,
                      });
                    }
                    writeCheckout({
                      pay: "paypal",
                      paypalOrderId: approval.orderId,
                      email: approval.email,
                      method,
                      giftBox,
                      giftNote,
                      giftMessage,
                      ...(next ? { address: next } : {}),
                    });
                    if (next) router.push(scoped("/checkout/review"));
                    else show({ message: checkout.paypalNote });
                  }}
                  onError={() => show({ message: checkout.paypalNote })}
                />
              ) : (
                <Button className={styles.paypal} variant="secondary" disabled>{checkout.paypal}</Button>
              )}
              <Button className={styles.amazon} variant="secondary" onClick={() => show({ message: checkout.amazonNote })}>{checkout.amazon}</Button>
            </div>

            <Form onSubmit={(event) => event.preventDefault()}>
              <section className={styles.section} aria-labelledby="address-heading">
                <div className={styles.sectionHead}>
                  <h2 id="address-heading">{checkout.addressHeading}</h2>
                  <p className={styles.required}>{checkout.required}</p>
                </div>
                <div className={styles.grid2}>
                  <TextInput label={checkout.firstName} required autoComplete="given-name" value={address.first} onChange={set("first")} />
                  <TextInput label={checkout.lastName} required autoComplete="family-name" value={address.last} onChange={set("last")} />
                </div>
                <TextInput label={checkout.address} required autoComplete="address-line1" value={address.line1} onChange={set("line1")} />
                <TextInput label={checkout.line2} autoComplete="address-line2" value={address.line2} onChange={set("line2")} />
                <div className={styles.grid2}>
                  <TextInput label={checkout.city} required autoComplete="address-level2" value={address.city} onChange={set("city")} />
                  <Select label={checkout.regionLabel} required value={region} placeholder={checkout.regionPlaceholder} options={checkout.regions} onChange={(event) => setRegion(event.target.value)} />
                </div>
                <div className={styles.grid2}>
                  <TextInput label={checkout.zip} required autoComplete="postal-code" value={address.zip} onChange={set("zip")} />
                  <Select label={checkout.countryLabel} required value={country} options={checkout.countries} onChange={(event) => setCountry(event.target.value)} />
                </div>
              </section>

              <section className={styles.section}>
                <RadioGroup className={styles.methods} legend={checkout.methodLegend} value={method} onChange={setMethod}>
                  {checkout.methods.map((option) => (
                    <Radio
                      key={option.id}
                      value={option.id}
                      className={option.id === method ? `${styles.method} ${styles.methodCurrent}` : styles.method}
                      label={(
                        <span className={styles.methodLabel}>
                          <span>{option.label}<small>{option.detail}</small></span>
                          <span>{money(option.price ?? 0)}</span>
                        </span>
                      )}
                    />
                  ))}
                </RadioGroup>
              </section>

              <section className={styles.section} aria-labelledby="gift-heading">
                <h2 id="gift-heading">{checkout.giftHeading}</h2>
                <div className={styles.gifts}>
                  <Checkbox label={checkout.giftBox} hint={checkout.giftBoxHint} checked={giftBox} onChange={(event) => setGiftBox(event.target.checked)} />
                  <Checkbox label={checkout.giftNote} checked={giftNote} onChange={(event) => setGiftNote(event.target.checked)} />
                </div>
                {giftNote && (
                  <TextInput label={checkout.giftMessage} value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} placeholder={checkout.giftPlaceholder} />
                )}
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
            </Form>
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
              <Button
                fullWidth
                disabled={!ready || count === 0}
                onClick={() => {
                  writeCheckout({
                    address: { ...address, region, country },
                    method,
                    giftBox,
                    giftNote,
                    giftMessage,
                  });
                  router.push(scoped("/checkout/billing"));
                }}
              >
                {checkout.continueBilling}
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
