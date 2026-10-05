import { CatalogPage } from "../../components/CatalogPage";
import { getCategoryPage, getSite, type StoreCatalog } from "../../lib/contentstack";
import { persistScope, scopeFor, scopeFrom } from "../../lib/scope";

export default function ClothingPage({ catalog }: { catalog: StoreCatalog }) {
  return <CatalogPage catalog={catalog} />;
}

export async function getServerSideProps(ctx: Parameters<typeof scopeFrom>[0] & { params?: { slug?: string } }) {
  const slug = ctx.params?.slug;
  if (!slug) return { notFound: true };
  const scope = scopeFrom(ctx);
  const site = await getSite(scope);
  const content = scopeFor(scope, site);
  persistScope(ctx, content);
  const catalog = await getCategoryPage(`/clothing/${slug}`, content);
  if (!catalog) return { notFound: true };
  return { props: { catalog } };
}
