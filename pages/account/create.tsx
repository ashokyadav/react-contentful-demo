import { useRef, useState, type FormEvent } from "react";
import { PageMeta } from "../../components/PageMeta";
import { useSite } from "../../components/SiteContext";
import { useRouter } from "next/router";
import {
  Button,
  Checkbox,
  Container,
  ErrorSummary,
  Form,
  FormGroup,
  TextInput,
} from "@myproject/core";
import { SiteFrame } from "../../components/SiteFrame";
import { createShopper, validEmail } from "../../lib/account";
import { getAccountPage, withScope, type AccountCopy } from "../../lib/contentstack";
import { getGlobalPageData, type PageDataContext } from "../../lib/pageData";
import styles from "../../styles/account.module.scss";

type CreateErrors = Partial<Record<"first" | "last" | "email" | "password" | "confirm", string>>;

export default function CreateAccountPage({ copy }: { copy: AccountCopy }) {
  const router = useRouter();
  const site = useSite();
  const summaryRef = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<CreateErrors>({});
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const first = String(data.get("first") || "").trim();
    const last = String(data.get("last") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    const next: CreateErrors = {};
    if (!first) next.first = copy.firstError;
    if (!last) next.last = copy.lastError;
    if (!validEmail(email)) next.email = copy.emailError;
    if (password.length < 8) next.password = copy.passwordRule;
    if (password !== confirm) next.confirm = copy.confirmError;
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setPending(true);
    const result = await createShopper(site.key, { first, last, email, password, emailOffers: data.get("offers") === "on" });
    if (!result.ok) {
      setPending(false);
      setErrors({ email: result.error === "taken" ? copy.taken : copy.emailError });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    router.push(withScope("/account", { site: site.key, locale: site.locale }));
  };

  const errorList = (Object.entries(errors) as Array<[keyof CreateErrors, string]>).map(([field, message]) => ({
    fieldId: `ca-${field}`,
    message,
  }));

  return (
    <SiteFrame>
      <PageMeta title={copy.create} description={copy.createLead} site={site.name} />
      <main id="main" className={styles.page}>
        <Container>
          <div className={styles.narrow}>
            <h1 className={styles.heading}>{copy.create}</h1>
            <p className={styles.lead}>{copy.createLead}</p>
            <Form onSubmit={onSubmit}>
              <ErrorSummary ref={summaryRef} errors={errorList} />
              <FormGroup legend={copy.name} columns={2}>
                <TextInput id="ca-first" name="first" label={copy.first} autoComplete="given-name" required error={errors.first} />
                <TextInput id="ca-last" name="last" label={copy.last} autoComplete="family-name" required error={errors.last} />
              </FormGroup>
              <FormGroup legend={copy.account} hideLegend>
                <TextInput id="ca-email" name="email" label={copy.email} type="email" autoComplete="email" required error={errors.email} />
                <TextInput id="ca-password" name="password" label={copy.password} type="password" autoComplete="new-password" required error={errors.password} />
                <TextInput id="ca-confirm" name="confirm" label={copy.confirm} type="password" autoComplete="new-password" required error={errors.confirm} />
              </FormGroup>
              <Checkbox name="offers" label={copy.offers} />
              <div className={styles.actions}>
                <Button type="submit" loading={pending}>{copy.createSubmit}</Button>
              </div>
            </Form>
            <p className={styles.switch}>
              {`${copy.have} `}
              <a href={withScope("/account", { site: site.key, locale: site.locale })}>{copy.signIn}</a>
            </p>
          </div>
        </Container>
      </main>
    </SiteFrame>
  );
}

export async function getServerSideProps(ctx: PageDataContext) {
  const { global, scope } = await getGlobalPageData(ctx);
  const copy = await getAccountPage(scope);
  if (!copy) return { notFound: true };
  return { props: { global, copy } };
}
