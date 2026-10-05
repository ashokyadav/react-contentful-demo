# Sample page: Storybook component and Contentstack

The page at `/sample` is a small working example of the storefront pattern. A Storybook component draws the hero. Contentstack stores the words and the photo. The page loads the entry on the server and passes it in as props.

Open it at [http://localhost:3000/sample](http://localhost:3000/sample).

The component file does not know Contentstack exists. The Contentstack entry does not know React exists. `pages/sample.tsx` is the only place those two meet.

## Files

| File | Role |
| --- | --- |
| `library/packages/core/src/components/HeroBanner/HeroBanner.tsx` | The component. Accepts props and renders them. |
| `library/packages/core/src/components/HeroBanner/HeroBanner.stories.tsx` | The Storybook story `Commerce/HeroBanner`. Uses sample props so the component can be reviewed alone. |
| `pages/sample.tsx` | Loads the entry and renders `<HeroBanner {...hero} />`. |
| `lib/contentstack.ts` | Calls the Contentstack Delivery API and maps entry fields onto component props. |
| `lib/scope.ts` | Reads `?site=` and `?locale=` (then cookies) and remembers them. |
| `pages/_app.tsx` | Wraps every page in `SiteTheme` from the Contentstack `site` entry. |

## 1. The component only accepts props

`HeroBanner` is exported from `@myproject/core`. Its props are:

| Prop | What it renders |
| --- | --- |
| `kicker` | Small line above the offer |
| `offer` | Large offer line |
| `note` | Paragraph under the offer |
| `fine` | Small print |
| `details` | Optional button next to the small print |
| `image` | Photo URL |
| `imageAlt` | Photo description |
| `actions` | Buttons. Each one has `label` and `href` |

The Storybook story fills those props with sample values so a designer can open `Commerce/HeroBanner` without a CMS. The live page replaces those sample values with the Contentstack entry.

`onNavigate` is optional. The sample page does not pass it, so a button click follows `href` with a normal page load.

## 2. The page renders the component

`pages/sample.tsx` has two parts: the React component, and `getServerSideProps`.

The React component receives `hero` and spreads it onto `HeroBanner`:

```tsx
{hero && <HeroBanner {...hero} />}
```

That is the whole binding on the page. There is no copy, photo URL, or button label written in the JSX. If `hero` is null, the banner is skipped and the note under it still shows.

`getServerSideProps` runs on the server for every request:

1. `scopeFrom` reads the site and locale.
2. `getSite` loads the matching Contentstack `site` entry.
3. `scopeFor` attaches that entry’s uid so later queries can filter by site.
4. `persistScope` writes `site` and `locale` cookies.
5. `getHomePage` loads `home_hero` and returns it as `hero`.
6. The function returns `{ props: { hero } }`. Next.js passes that object into `SamplePage`.

If the Contentstack call fails, `hero` is `null` and the page still renders.

## 3. Which site and which locale

`lib/scope.ts` decides the site before any content is loaded.

- `?site=` on the URL wins.
- Otherwise the `site` cookie is used.
- The same order applies to `?locale=` and the `locale` cookie.
- An empty site is not filled in with a name written in code. `getSite` looks up Contentstack `site` entries and picks the one whose key or uid matches. If nothing matches, it uses the entry with `is_default`, then the first entry.

`scopeFor` then sets:

- `site` to the entry key (for the cookie and later links)
- `siteUid` to the Contentstack uid (for filtering entries)
- `locale` to the requested locale, or the first locale on the site entry

`pages/_app.tsx` does the same lookup for the header, footer, and theme, and stores the resolved site in `sessionStorage` so a click that drops the query string stays on that site.

## 4. The Contentstack request

All Delivery API calls live in `lib/contentstack.ts`. The sample page reaches them through `getHomePage`, which calls `firstEntry("home_hero", scope)`.

`firstEntry` calls `entriesOf`. That function builds the request:

- Host: `CONTENTSTACK_CDN` from `.env.local`, otherwise `https://eu-cdn.contentstack.com`
- Path: `/v3/content_types/home_hero/entries`
- Query: `locale` from the scope (`en-us` when none was requested)
- Headers: `api_key` and `access_token` from `.env.local`

The tokens stay on the server. The browser never sees them.

If the requested locale is not `en-us` and Contentstack returns an error, the same request is tried again with `locale=en-us`.

`pickScoped` then chooses one entry from the list:

- Prefer an entry whose **Sites** field includes the current site uid.
- Otherwise use an entry with no site selected. An empty **Sites** field means the entry is shared by every site.
- The current `home_hero` entry is shared, so Online Store Example1, Online Store Example2, and Online Store Example3 all receive the same hero until an editor assigns **Sites** or publishes a locale-specific version.

## 5. Data binding

Contentstack field names are not the same as the React prop names. `heroOf` in `lib/contentstack.ts` copies each field across.

| Contentstack field on `home_hero` | Prop on `HeroBanner` | Rule |
| --- | --- | --- |
| `kicker` | `kicker` | Trimmed text. Required. |
| `offer` | `offer` | Trimmed text. Required. |
| `note` | `note` | Trimmed text. Required. |
| `fine` | `fine` | Trimmed text. Required. |
| `details` | `details` | Trimmed text. Omitted when empty. |
| `image` | `image` | A URL string, or a file object’s `url`. Required. |
| `image_alt` | `imageAlt` | Falls back to `kicker` when empty. |
| `actions[].label` | `actions[].label` | Dropped when label or url is empty. |
| `actions[].url` | `actions[].href` | A URL string, or a link field’s `href`. |

If `kicker`, `offer`, `note`, `fine`, or `image` is missing, `heroOf` returns `null` and the banner is not rendered.

`getHomePage` also loads the other homepage sections (`home_arrivals`, `home_feature`, `home_product_row`, `home_services`, `home_heritage`, `home_offer`) and the product catalog. The sample page keeps only `hero` and throws the rest away.

## 6. Colors and fonts come from the site entry

`HeroBanner` does not take a color prop. `pages/_app.tsx` wraps the page in `SiteTheme` and passes the Contentstack `site` entry. That entry’s `theme` group sets CSS variables such as `--color-action-primary`, `--color-background-primary`, and `--font-family-display`.

The sample note uses those same variables, so the sentence under the hero follows the current site’s theme.

Storybook uses the same `SiteTheme` wrapper. Its toolbar loads the site list from `http://localhost:3000/api/sites`, which is `getSites()` in `lib/contentstack.ts`.

## 7. What the component does with the props

Inside `HeroBanner.tsx`:

- `kicker` and `offer` go in the heading.
- `note` is the paragraph.
- Each action becomes a button. The click calls `onNavigate(href)` when the page passed that callback, otherwise `window.location.assign(href)`.
- `fine` is the small print. When `details` is set, a button is rendered beside it and calls `onDetails`. The sample page does not pass `onDetails`, so that button is present but has no handler.
- `image` and `imageAlt` go to the `Image` component.

## 8. The same pattern on the rest of the store

The homepage, category pages, and product page use the same three steps: resolve the site, fetch the content type, map fields, render a Storybook component.

| Page | Content type | Mapper | Component |
| --- | --- | --- | --- |
| `/` and `/sample` | `home_hero` | `heroOf` | `HeroBanner` |
| `/` | `home_arrivals`, `home_feature`, `home_product_row`, `home_services`, `home_heritage`, `home_offer` | `arrivalsOf`, `featureOf`, `rowOf`, `servicesOf`, `heritageOf`, `offerOf` | `ArrivalBand`, `FeatureBand`, `ProductRow`, `ServiceGrid`, `HeritageNote`, `OfferPrompt` |
| `/clothing/...` | `category_page` | `catalogOf` | Listing components |
| `/product/[slug]` | `product` | `productOf` | Product page components, including `Gallery` |
| Every page | `mega_menu`, `footer`, `site` | menu, footer, and `siteOf` | Header, footer, and `SiteTheme` |

Product entries are different per site because each product’s **Sites** field points at one site. `entryMatchesSite` drops a product when its sites do not include the current site uid. An empty **Sites** field would show that product on every site.

