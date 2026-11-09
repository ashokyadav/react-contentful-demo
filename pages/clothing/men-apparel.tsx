import { CatalogPage } from "../../components/CatalogPage";
import { getCategoryPage, type StoreCatalog } from "../../lib/contentstack";
import { getGlobalPageData, type PageDataContext } from "../../lib/pageData";

export default function MenApparelPage({ catalog }: { catalog: StoreCatalog }) {
  return <CatalogPage catalog={catalog} />;
}

export async function getServerSideProps(ctx: PageDataContext) {
  const { global, scope } = await getGlobalPageData(ctx);
  const catalog = await getCategoryPage("/clothing/men-apparel", scope);
  if (!catalog) return { notFound: true };
  return { props: { global, catalog } };
}
