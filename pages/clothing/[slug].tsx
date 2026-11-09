import { CatalogPage } from "../../components/CatalogPage";
import { getCategoryPage, type StoreCatalog } from "../../lib/contentstack";
import { getGlobalPageData, type PageDataContext } from "../../lib/pageData";

export default function ClothingPage({ catalog }: { catalog: StoreCatalog }) {
  return <CatalogPage catalog={catalog} />;
}

export async function getServerSideProps(ctx: PageDataContext & { params?: { slug?: string } }) {
  const slug = ctx.params?.slug;
  if (!slug) return { notFound: true };
  const { global, scope } = await getGlobalPageData(ctx);
  const catalog = await getCategoryPage(`/clothing/${slug}`, scope);
  if (!catalog) return { notFound: true };
  return { props: { global, catalog } };
}
