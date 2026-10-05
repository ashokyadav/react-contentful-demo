import Document, { Html, Head, Main, NextScript, type DocumentContext } from "next/document";

type Props = { locale: string };

export default class StoreDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext) {
    const initial = await Document.getInitialProps(ctx);
    const queryLocale = typeof ctx.query.locale === "string" ? ctx.query.locale : "";
    const cookie = ctx.req?.headers.cookie || "";
    const match = cookie.match(/(?:^|; )locale=([^;]*)/);
    const locale = queryLocale || (match ? decodeURIComponent(match[1]) : "en-us");
    return { ...initial, locale };
  }

  render() {
    const lang = this.props.locale === "fr-fr" ? "fr" : "en";
    return (
      <Html lang={lang}>
        <Head />
        <body className="base">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
