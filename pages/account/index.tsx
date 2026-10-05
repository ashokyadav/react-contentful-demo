import { useEffect, useRef, useState, type FormEvent } from "react";
import { PageMeta } from "../../components/PageMeta";
import { useRouter } from "next/router";
import {
  Alert,
  Button,
  Container,
  ErrorSummary,
  Form,
  FormGroup,
  List,
  ListItem,
  Navigation,
  Sidebar,
  Table,
  TextInput,
} from "@myproject/core";
import { IconBag, IconUser } from "@myproject/icons";
import { SiteFrame } from "../../components/SiteFrame";
import { currentShopper, signIn, signOut, validEmail, type Shopper } from "../../lib/account";
import { useSite } from "../../components/SiteContext";
import { fill, getAccountPage, getCheckout, getSite, type AccountCopy } from "../../lib/contentstack";
import { listOrders, readOrder, type PlacedOrder } from "../../lib/checkoutDraft";
import { persistScope, scopeFor, scopeFrom } from "../../lib/scope";
import styles from "../../styles/account.module.scss";

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

type SignInErrors = Partial<Record<"email" | "password", string>>;

export default function AccountPage({ copy, methods }: { copy: AccountCopy; methods: { id: string; label: string; detail: string; price?: number }[] }) {
  const router = useRouter();
  const site = useSite();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [shopper, setShopper] = useState<Shopper | null>(null);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [receipt, setReceipt] = useState(false);
  const [errors, setErrors] = useState<SignInErrors>({});
  const view = router.query.view === "orders" ? "orders" : "profile";

  useEffect(() => {
    let active = true;
    currentShopper().then(async (profile) => {
      if (!active) return;
      setShopper(profile);
      setReceipt(Boolean(readOrder()));
      if (profile) setOrders(await listOrders(site.key, profile.email));
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [site.key]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const next: SignInErrors = {};
    if (!validEmail(email)) next.email = copy.emailError;
    if (!password) next.password = copy.passwordError;
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setPending(true);
    const result = await signIn(site.key, email, password);
    setPending(false);
    if (!result.ok) {
      setErrors(result.error === "mismatch" ? { password: copy.mismatch } : { email: copy.missing });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setShopper(result.shopper);
    setOrders(await listOrders(site.key, result.shopper.email));
  };

  const rows = orders.map((item) => {
    const method = methods.find((option) => option.id === item.method) ?? methods[0];
    const subtotal = item.lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    return {
      number: item.number,
      items: item.lines.reduce((sum, line) => sum + line.quantity, 0),
      total: money(subtotal + (method?.price ?? 0)),
    };
  });
  const errorList = (Object.entries(errors) as Array<[keyof SignInErrors, string]>).map(([field, message]) => ({
    fieldId: `si-${field}`,
    message,
  }));

  return (
    <SiteFrame>
      <PageMeta title={view === "orders" ? copy.orders : copy.title} description={copy.lead} site={site.name} />
      <main id="main" className={styles.page}>
        <Container>
          {!ready ? null : shopper ? (
            <>
              <h1 className={styles.heading}>{copy.title}</h1>
              <p className={styles.lead}>{fill(copy.hello, { name: shopper.first })}</p>
              <Sidebar
                label={copy.title}
                main={view === "orders" ? (
                  <div className={styles.panel}>
                    <h2 className="visually-hidden">{copy.orders}</h2>
                    <Table
                      caption={copy.orders}
                      columns={[
                        { key: "number", header: copy.order, rowHeader: true, cell: (row) => row.number, sortValue: (row) => row.number },
                        { key: "items", header: copy.items, cell: (row) => row.items, sortValue: (row) => row.items },
                        { key: "total", header: copy.total, align: "end", cell: (row) => row.total },
                      ]}
                      rows={rows}
                      getRowKey={(row) => row.number}
                      emptyMessage={copy.empty}
                    />
                    {receipt && <a href="/checkout/confirmation">{copy.receipt}</a>}
                  </div>
                ) : (
                  <div className={styles.panel}>
                    <h2 className="visually-hidden">{copy.profile}</h2>
                    <List variant="plain" spacing="sm">
                      <ListItem description={`${shopper.first} ${shopper.last}`}>{copy.nameLabel}</ListItem>
                      <ListItem description={shopper.email}>{copy.email}</ListItem>
                      <ListItem description={shopper.emailOffers ? copy.updatesOn : copy.updatesOff}>{copy.updates}</ListItem>
                    </List>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        signOut().then(() => {
                          setShopper(null);
                          setErrors({});
                        });
                      }}
                    >
                      {copy.signOut}
                    </Button>
                  </div>
                )}
              >
                <Navigation
                  label={copy.title}
                  items={[
                    { label: copy.profile, href: "/account", current: view === "profile", icon: <IconUser size="sm" /> },
                    { label: copy.orders, href: "/account?view=orders", current: view === "orders", icon: <IconBag size="sm" /> },
                  ]}
                />
              </Sidebar>
            </>
          ) : (
            <div className={styles.narrow}>
              <h1 className={styles.heading}>{copy.signIn}</h1>
              <p className={styles.lead}>{copy.lead}</p>
              <Form onSubmit={onSubmit}>
                <ErrorSummary ref={summaryRef} errors={errorList} />
                <FormGroup legend={copy.signIn} hideLegend>
                  <TextInput id="si-email" name="email" label={copy.email} type="email" autoComplete="email" required error={errors.email} />
                  <TextInput id="si-password" name="password" label={copy.password} type="password" autoComplete="current-password" required error={errors.password} />
                </FormGroup>
                <div className={styles.actions}>
                  <Button type="submit" loading={pending}>{copy.submit}</Button>
                </div>
              </Form>
              <p className={styles.switch}>
                {`${copy.newHere} `}
                <a href="/account/create">{copy.create}</a>
              </p>
              {errors.email === copy.missing && (
                <Alert tone="info" title={copy.create}>
                  <p><a href="/account/create">{copy.create}</a></p>
                </Alert>
              )}
            </div>
          )}
        </Container>
      </main>
    </SiteFrame>
  );
}

export async function getServerSideProps(ctx: Parameters<typeof scopeFrom>[0]) {
  const scope = scopeFrom(ctx);
  const site = await getSite(scope);
  const content = scopeFor(scope, site);
  persistScope(ctx, content);
  const [copy, checkout] = await Promise.all([getAccountPage(content), getCheckout(content)]);
  if (!copy || !checkout) return { notFound: true };
  return { props: { copy, methods: checkout.methods } };
}
