# library — Global Design System components

Monorepo with the three library packages and a Storybook that documents every component.

```
packages/
  core/          React components (source, last-mile compiled)
  foundations/   tokens.css, base.scss, fonts.scss, mixins
  icons/         SVG icon components
.storybook/           Storybook 8 + @storybook/nextjs + addon-a11y
```

## Run it

Requires Node 22+.

```bash
npm install
npm run storybook        # http://localhost:6006
npm run build-storybook  # static site in storybook-static/
npm run typecheck
```

## Use in an app (Next.js)

```js
// next.config.js
module.exports = {
  transpilePackages: ["@myproject/core", "@myproject/foundations", "@myproject/icons"],
};
```

```tsx
import "@myproject/foundations/themes/global/na-core/tokens.css";
import "@myproject/foundations/styles/base.scss";
import { Button, TextInput, ToastProvider } from "@myproject/core";

// <body className="base">
```

Documented story path: `?path=/story/core-videoplayer--inline-variant`.

## Publishing

Point the packages at your GitLab npm registry (see the DAISY auth docs) and `npm publish -w packages/core` etc. Packages ship TypeScript source; consumers compile it.
