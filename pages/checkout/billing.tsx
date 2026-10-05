import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Button,
  Checkbox,
  Form,
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
import { checkoutStepsFor, getCheckout, getSite, type StoreCheckout } from "../../lib/contentstack";
import { readCheckout, writeCheckout, type CheckoutAddress } from "../../lib/checkoutDraft";
import { persistScope, scopeFor, scopeFrom } from "../../lib/scope";
import styles from "../../styles/shipping.module.scss";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const emptyAddress = { first: "", last: "", line1: "", line2: "", city: "", zip: "" };

export default function BillingPage({ checkout }: { checkout: StoreCheckout }) {
  const router = useRouter();
  const { show } = useToast();
  const { lines } = useCart();
  const footer = useFooter();
  const site = useSite();
  const [pay, setPay] = useState(checkout.payments[0]?.id || "");
  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [same, setSame] = useState(true);
  const [country, setCountry] = useState(checkout.countries[0]?.value || "");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [method, setMethod] = useState(checkout.methods[0]?.id || "");

  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = checkout.methods.find((option) => option.id === method) ?? checkout.methods[0];
  const digits = cardNumber.replace(/\D/g, "");
  const emailReady = /^\S+@\S+\.\S+$/.test(email);
  const cardReady = cardName.trim().length > 0 && digits.length >= 13 && /^\d{2}\/\d{2}$/.test(cardExp) && cardCvv.replace(/\D/g, "").length >= 3;
  const billingReady = same || [address.first, address.last, address.line1, address.city, address.zip, region].every((value) => value.trim().length > 0);
  const ready = emailReady && billingReady && (pay === "card" ? cardReady : pay !== "paypal");
  const set = (key: keyof typeof address) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setAddress((current) => ({ ...current, [key]: event.target.value }));

  useEffect(() => {
    const draft = readCheckout();
    if (draft.method) setMethod(draft.method);
    if (draft.email) setEmail(draft.email);
    if (draft.pay) setPay(draft.pay);
    if (draft.cardName) setCardName(draft.cardName);
    if (draft.cardExp) setCardExp(draft.cardExp);
    if (draft.billingSame === false) setSame(false);
    if (draft.billing) {
      setCountry(draft.billing.country || checkout.countries[0]?.value || "");
      setRegion(draft.billing.region);
      setAddress({
        first: draft.billing.first,
        last: draft.billing.last,
        line1: draft.billing.line1,
        line2: draft.billing.line2,
        city: draft.billing.city,
        zip: draft.billing.zip,
      });
    }
  }, []);

  const billingAddress = (): CheckoutAddress | undefined => {
    if (same) return undefined;
    return { ...address, region, country };
  };

  return (
    <>
      <Head>
        <title>{checkout.steps[1]?.label}</title>
      </Head>
      <div className={styles.shell}>
        <header className={styles.header}>
          <a href="/" className={styles.wordmark}>{site.name}</a>
          <Stepper current={1} steps={checkoutStepsFor(checkout, 1)} />
          <a href="/cart" className={styles.back}>{checkout.backToBag} <IconBag size="sm" /></a>
        </header>

        <main id="main" className={styles.main}>
          <div>
            <p className={styles.signIn}>
              {`${checkout.signInPrompt} `}
              <Button variant="tertiary" onClick={() => router.push("/account")}>{checkout.signIn}</Button>
            </p>

            <h1 className="visually-hidden">{checkout.steps[1]?.label}</h1>
            <Form onSubmit={(event) => event.preventDefault()}>
              <section className={styles.section} aria-labelledby="contact-heading">
                <div className={styles.sectionHead}>
                  <h2 id="contact-heading">{checkout.contactHeading}</h2>
                  <p className={styles.required}>{checkout.required}</p>
                </div>
                <TextInput label={checkout.email} type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </section>

              <section className={styles.section}>
                <RadioGroup className={styles.methods} legend={checkout.paymentLegend} value={pay} onChange={setPay}>
                  {checkout.payments.map((option) => (
                    <Radio
                      key={option.id}
                      value={option.id}
                      className={option.id === pay ? `${styles.method} ${styles.methodCurrent}` : styles.method}
                      label={(
                        <span className={styles.methodLabel}>
                          <span>{option.label}<small>{option.detail}</small></span>
                        </span>
                      )}
                    />
                  ))}
                </RadioGroup>
                {pay === "card" && (
                  <div className={styles.section}>
                    <TextInput label={checkout.nameOnCard} required autoComplete="cc-name" value={cardName} onChange={(event) => setCardName(event.target.value)} />
                    <TextInput label={checkout.cardNumber} required inputMode="numeric" autoComplete="cc-number" value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} />
                    <div className={styles.grid2}>
                      <TextInput label={checkout.expiration} required placeholder={checkout.expirationPlaceholder} autoComplete="cc-exp" value={cardExp} onChange={(event) => setCardExp(event.target.value)} />
                      <TextInput label={checkout.securityCode} required inputMode="numeric" autoComplete="cc-csc" value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} />
                    </div>
                  </div>
                )}
                {pay === "paypal" && count > 0 && (
                  <PayPalButton
                    amount={(subtotal + (shipping?.price ?? 0)).toFixed(2)}
                    onApproved={(approval) => {
                      const nextEmail = approval.email || email;
                      setEmail(nextEmail);
                      writeCheckout({
                        email: nextEmail,
                        pay: "paypal",
                        paypalOrderId: approval.orderId,
                        cardName: "",
                        cardLast4: "",
                        cardExp: "",
                        billingSame: same,
                        billing: billingAddress(),
                        ...(approval.address ? { address: approval.address } : {}),
                      });
                      router.push("/checkout/review");
                    }}
                    onError={() => show({ message: checkout.paypalNote })}
                  />
                )}
              </section>

              <section className={styles.section} aria-labelledby="billing-heading">
                <h2 id="billing-heading">{checkout.billingHeading}</h2>
                <Checkbox label={checkout.sameAsShipping} checked={same} onChange={(event) => setSame(event.target.checked)} />
                {!same && (
                  <>
                    <div className={styles.grid2}>
                      <TextInput label={checkout.firstName} required autoComplete="billing given-name" value={address.first} onChange={set("first")} />
                      <TextInput label={checkout.lastName} required autoComplete="billing family-name" value={address.last} onChange={set("last")} />
                    </div>
                    <TextInput label={checkout.address} required autoComplete="billing address-line1" value={address.line1} onChange={set("line1")} />
                    <TextInput label={checkout.line2} autoComplete="billing address-line2" value={address.line2} onChange={set("line2")} />
                    <div className={styles.grid2}>
                      <TextInput label={checkout.city} required autoComplete="billing address-level2" value={address.city} onChange={set("city")} />
                      <Select label={checkout.regionLabel} required value={region} placeholder={checkout.regionPlaceholder} options={checkout.regions} onChange={(event) => setRegion(event.target.value)} />
                    </div>
                    <div className={styles.grid2}>
                      <TextInput label={checkout.zip} required autoComplete="billing postal-code" value={address.zip} onChange={set("zip")} />
                      <Select label={checkout.countryLabel} required value={country} options={checkout.countries} onChange={(event) => setCountry(event.target.value)} />
                    </div>
                  </>
                )}
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
                    email,
                    pay,
                    cardName: pay === "card" ? cardName : "",
                    cardLast4: pay === "card" ? digits.slice(-4) : "",
                    cardExp: pay === "card" ? cardExp : "",
                    billingSame: same,
                    billing: billingAddress(),
                  });
                  router.push("/checkout/review");
                }}
              >
                {checkout.continueReview}
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
