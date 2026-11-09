import { useState } from "react";
import { PageMeta } from "../components/PageMeta";
import { useSite } from "../components/SiteContext";
import { useRouter } from "next/router";
import {
  Accordion,
  Alert,
  Button,
  Container,
  Form,
  Image,
  OptionGroup,
  Price,
  QuantityInput,
  TextInput,
  useToast,
} from "@myproject/core";
import { cartKey, useCart, type CartLine } from "../components/CartStore";
import { PayPalButton } from "../components/PayPalButton";
import { SiteFrame } from "../components/SiteFrame";
import { fill, getCartPage, getCartPictures, withScope, type CartPicture, type StoreCart } from "../lib/contentstack";
import { writeCheckout } from "../lib/checkoutDraft";
import { getGlobalPageData, type PageDataContext } from "../lib/pageData";
import styles from "../styles/cart.module.scss";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

function imageSources(line: CartLine, pictures: CartPicture[]) {
  const picture = pictures.find((item) => item.id === line.id);
  const swatch = picture?.swatches.find((item) => item.value === line.color);
  return [...new Set([swatch?.image, picture?.image, line.image].filter((src): src is string => Boolean(src)))];
}

function LineImage({ line, pictures }: { line: CartLine; pictures: CartPicture[] }) {
  const sources = imageSources(line, pictures);
  const [index, setIndex] = useState(0);
  const src = sources[index];
  if (!src) return null;
  return (
    <Image
      src={src}
      alt={line.alt}
      aspectRatio="3/4"
      loading="eager"
      decoding="auto"
      onError={() => setIndex((current) => (current + 1 < sources.length ? current + 1 : current))}
    />
  );
}

function BagLine({
  line,
  page,
  pictures,
  onQuantity,
  onDelivery,
  onEdit,
  onRemove,
  onSave,
  saveLabel,
  onWishlist,
}: {
  line: CartLine;
  page: StoreCart;
  pictures: CartPicture[];
  onQuantity: (quantity: number) => void;
  onDelivery?: (delivery: CartLine["delivery"]) => void;
  onEdit: () => void;
  onRemove: () => void;
  onSave?: () => void;
  saveLabel?: string;
  onWishlist?: () => void;
}) {
  return (
    <article className={styles.line}>
      <a href={line.href} className={styles.thumb}>
        <LineImage key={imageSources(line, pictures).join("|")} line={line} pictures={pictures} />
      </a>
      <div>
        <h2><a href={line.href}>{line.title}</a></h2>
        {line.color && (
          <p className={styles.meta}>
            <span className={styles.swatch} style={{ background: line.color }} aria-hidden="true" />
            <span className="visually-hidden">{line.color}</span>
          </p>
        )}
        <div className={styles.priceRow}>
          <Price value={line.price} compareAt={line.compareAt} />
          {onDelivery ? (
            <QuantityInput label={page.qty} value={line.quantity} min={1} max={10} onChange={onQuantity} />
          ) : (
            <p className={styles.meta}>{`${page.qty}: ${line.quantity}`}</p>
          )}
        </div>
        {onDelivery && (
          <OptionGroup
            className={styles.fulfillment}
            legend={page.shipping}
            showValue={false}
            value={line.delivery}
            onChange={(value) => onDelivery(value as CartLine["delivery"])}
            options={[
              { value: "ship", label: page.shipToMe },
              { value: "pickup", label: page.freePickup },
            ]}
          />
        )}
        <p className={styles.stock}>{page.inStock}</p>
        <div className={styles.lineActions}>
          <Button variant="tertiary" onClick={onEdit}>{page.edit}</Button>
          <Button variant="tertiary" onClick={onRemove}>{page.remove}</Button>
          {onWishlist && <Button variant="tertiary" onClick={onWishlist}>{page.moveToWishlist}</Button>}
          {onSave && <Button variant="tertiary" onClick={onSave}>{saveLabel ?? page.saveForLater}</Button>}
        </div>
      </div>
    </article>
  );
}

export default function CartPage({ page, pictures = [] }: { page: StoreCart; pictures?: CartPicture[] }) {
  const router = useRouter();
  const site = useSite();
  const scoped = (href: string) => withScope(href, { site: site.key, locale: site.locale });
  const { show } = useToast();
  const { lines, saved, updateQuantity, setDelivery, remove, saveForLater, moveToBag } = useCart();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [codeError, setCodeError] = useState<string | undefined>();
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const ships = lines.some((line) => line.delivery === "ship");
  const shipping = count === 0 || !ships || subtotal >= page.freeShippingAt ? 0 : page.shippingFlat;
  const total = Math.max(0, subtotal - (count === 0 ? 0 : discount)) + shipping;
  const cardTotal = subtotal * page.cardRate;

  const applyCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (count === 0) {
      setCodeError(page.emptyCode);
      return;
    }
    if (code.trim().toUpperCase() === page.promoCode) {
      setDiscount(page.promoOff);
      setCodeError(undefined);
      show({ tone: "success", message: fill(page.promoApplied, { code: page.promoCode }) });
      return;
    }
    setDiscount(0);
    setCodeError(page.promoInvalid);
  };

  return (
    <SiteFrame>
      <PageMeta title={page.title} description={`${page.bannerText} ${page.bannerPrompt}`.trim()} site={site.name} />
      <main id="main" className={styles.page}>
        <Container size="xl">
          <p className={styles.banner}>
            {`${page.bannerText} ${page.bannerPrompt} `}
            <a href={page.bannerHref}>{page.bannerAction}</a>
          </p>

          <div className={styles.layout}>
            <section aria-labelledby="ship-heading">
              <h1 id="ship-heading" className={styles.sectionTitle}>
                {fill(page.shipHeading, { count })}
              </h1>
              {lines.length > 0 ? (
                <div className={styles.lines}>
                  {lines.map((line) => {
                    const key = cartKey(line);
                    return (
                      <BagLine
                        key={key}
                        page={page}
                        pictures={pictures}
                        line={{ ...line, href: scoped(line.href) }}
                        onQuantity={(quantity) => updateQuantity(key, quantity)}
                        onDelivery={(delivery) => setDelivery(key, delivery)}
                        onEdit={() => router.push(scoped(line.href))}
                        onRemove={() => remove(key)}
                        onWishlist={() => {
                          remove(key);
                          show({ tone: "success", message: fill(page.wishlistSaved, { title: line.title }) });
                        }}
                        onSave={() => saveForLater(key)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className={styles.empty}>
                  <p>{page.empty}</p>
                  <Button onClick={() => router.push(scoped(page.continueHref))}>{page.continueShopping}</Button>
                </div>
              )}

              {saved.length > 0 && (
                <div className={styles.saved}>
                  <h2 className={styles.sectionTitle}>{fill(page.savedHeading, { count: saved.length })}</h2>
                  <div className={styles.lines}>
                    {saved.map((line) => {
                      const key = cartKey(line);
                      return (
                        <BagLine
                          key={key}
                          page={page}
                          pictures={pictures}
                          line={{ ...line, href: scoped(line.href) }}
                          onQuantity={() => undefined}
                          onEdit={() => router.push(scoped(line.href))}
                          onRemove={() => remove(key)}
                          onSave={() => moveToBag(key)}
                          saveLabel={page.moveToBag}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <aside className={styles.summary} aria-label={page.summaryLabel}>
              <p className={styles.rewardsNote}>
                <strong>{page.rewardsTitle}</strong>
                {page.rewardsNote}
              </p>
              <Form className={styles.promo} onSubmit={applyCode}>
                <TextInput
                  label={page.promoPlaceholder}
                  hideLabel
                  fieldClassName={styles.promoField}
                  placeholder={page.promoPlaceholder}
                  value={code}
                  error={codeError}
                  onChange={(event) => setCode(event.target.value)}
                />
                <Button type="submit" variant="secondary">{page.apply}</Button>
              </Form>
              {discount > 0 && count > 0 && <Alert tone="success">{fill(page.codeSavings, { code: page.promoCode, amount: money(discount) })}</Alert>}
              <dl className={styles.totals}>
                <div><dt>{page.subtotal}</dt><dd>{money(subtotal)}</dd></div>
                <div><dt>{page.shipping}</dt><dd>{shipping === 0 ? page.free : money(shipping)}</dd></div>
                <div><dt>{page.tax}</dt><dd>—</dd></div>
                <div className={styles.total}><dt>{page.estimatedTotal}</dt><dd>{money(total)}</dd></div>
              </dl>
              {count > 0 && (
                <p className={styles.cardNote}>
                  {fill(page.cardNote, { amount: money(cardTotal) })}
                </p>
              )}
              <Accordion
                headingLevel={2}
                items={[
                  { id: "savings", title: page.savingsTitle, content: <p>{page.savingsText}</p> },
                  { id: "idme", title: page.idmeTitle, content: <p>{page.idmeText}</p> },
                ]}
              />
              <div className={styles.pay}>
                <Button fullWidth disabled={count === 0} onClick={() => router.push(scoped("/checkout/shipping"))}>{page.checkout}</Button>
                {count > 0 && total > 0 ? (
                  <PayPalButton
                    amount={total.toFixed(2)}
                    onApproved={(approval) => {
                      writeCheckout({
                        pay: "paypal",
                        paypalOrderId: approval.orderId,
                        email: approval.email,
                        ...(approval.address ? { address: approval.address } : {}),
                      });
                      router.push(scoped(approval.address ? "/checkout/review" : "/checkout/shipping"));
                    }}
                    onError={() => show({ message: page.paypalNote })}
                  />
                ) : (
                  <Button fullWidth className={styles.paypal} variant="secondary" disabled>{page.paypal}</Button>
                )}
                <Button fullWidth className={styles.amazon} variant="secondary" disabled={count === 0} onClick={() => show({ message: page.amazonNote })}>{page.amazon}</Button>
              </div>
              <p className={styles.installment}>{page.installment}</p>
              <div className={styles.help}>
                <h2>{page.helpTitle}</h2>
                <p>{page.help}</p>
              </div>
            </aside>
          </div>
        </Container>
      </main>
    </SiteFrame>
  );
}

export async function getServerSideProps(ctx: PageDataContext) {
  const { global, scope } = await getGlobalPageData(ctx);
  const page = await getCartPage(scope);
  if (!page) return { notFound: true };
  const pictures = await getCartPictures(scope);
  return { props: { global, page, pictures } };
}
