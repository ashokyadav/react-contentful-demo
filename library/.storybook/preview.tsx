import type { Preview } from "@storybook/react";
import React from "react";
import { SiteTheme, type SiteThemeValue } from "../packages/core/src/components/SiteTheme/SiteTheme";
import "@myproject/foundations/themes/global/na-core/tokens.css";
import "@myproject/foundations/styles/base.scss";
import "@myproject/foundations/styles/fonts.scss";

type PreviewSite = SiteThemeValue & { id?: string; isDefault?: boolean };

async function loadSites(): Promise<PreviewSite[]> {
  try {
    const response = await fetch("http://localhost:3000/api/sites");
    if (!response.ok) return [];
    const body = await response.json();
    return Array.isArray(body) ? body : [];
  } catch {
    return [];
  }
}

const sites = await loadSites();
const initial = sites.find((site) => site.isDefault) || sites[0];

const preview: Preview = {
  tags: ["autodocs"],
  globalTypes: {
    site: {
      description: "Site whose design parameters wrap every component",
      toolbar: {
        title: "Site",
        icon: "globe",
        items: sites.map((site) => ({ value: site.id || site.key, title: site.name || site.key })),
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Locale for the site",
      toolbar: {
        title: "Locale",
        icon: "globe",
        items: (initial?.locales || []).map((code) => ({ value: code, title: code })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    site: initial?.id || initial?.key || "",
    locale: initial?.locale || initial?.locales?.[0] || "",
  },
  decorators: [
    (Story, context) => {
      const selected = sites.find((site) => site.id === context.globals.site || site.key === context.globals.site) || initial;
      const story = <Story />;
      if (!selected) return <div className="base">{story}</div>;
      return (
        <div className="base">
          <SiteTheme theme={{ ...selected, locale: String(context.globals.locale || selected.locale) }}>
            {story}
          </SiteTheme>
        </div>
      );
    },
  ],
  parameters: {
    layout: "padded",
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    a11y: {
      config: {},
      options: { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] } },
    },
    options: {
      storySort: { order: ["Introduction", "Core", "Layout", "Media", "Navigation", "Feedback", "Data Display", "Form", "Product"] },
    },
  },
};
export default preview;
