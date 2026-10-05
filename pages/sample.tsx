import { HeroBanner } from "@myproject/core";
import { PageMeta } from "../components/PageMeta";
import { useSite } from "../components/SiteContext";
import { SiteFrame } from "../components/SiteFrame";
import { getHomePage, getSite, type StoreHome } from "../lib/contentstack";
import { persistScope, scopeFor, scopeFrom } from "../lib/scope";
import styles from "../styles/sample.module.scss";

type Props = { hero: StoreHome["hero"] };

export default function SamplePage({ hero }: Props) {
  const site = useSite();
  return (
    <SiteFrame>
      <PageMeta title={hero?.offer || site.name} description={hero?.note} site={hero ? site.name : ""} />
      <main id="main" className={styles.page}>
        {hero && <HeroBanner {...hero} />}
        <p className={styles.note}>
          HeroBanner is a Storybook component. The words and photo come from the Contentstack entry home_hero.
        </p>
      </main>
    </SiteFrame>
  );
}

export async function getServerSideProps(ctx: Parameters<typeof scopeFrom>[0]) {
  const scope = scopeFrom(ctx);
  const site = await getSite(scope);
  const content = scopeFor(scope, site);
  persistScope(ctx, content);
  const home = await getHomePage(content).catch(() => null);
  return { props: { hero: home?.hero ?? null } };
}
