import Head from "next/head";

export function PageMeta({ title, description, site }: { title: string; description?: string; site?: string }) {
  const page = title.trim();
  const name = site?.trim() || "";
  const documentTitle = page && name && page !== name ? `${page} | ${name}` : page || name;
  const summary = description?.replace(/\s+/g, " ").trim() || "";
  if (!documentTitle && !summary) return null;
  return (
    <Head>
      {documentTitle ? <title>{documentTitle}</title> : null}
      {summary ? <meta name="description" content={summary} /> : null}
    </Head>
  );
}
