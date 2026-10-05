import type { CSSProperties, ReactNode } from "react";

/** Design parameters for one site. Contentstack stores the same fields per site. */
export interface SiteThemeValue {
  key: string;
  name: string;
  locale: string;
  locales: string[];
  ink: string;
  paper: string;
  accent: string;
  action: string;
  actionHover: string;
  displayFont: string;
  primaryFont: string;
  radius: string;
}

/** Used only until a Contentstack site entry supplies the real values. */
export const emptySiteTheme: SiteThemeValue = {
  key: "",
  name: "",
  locale: "",
  locales: [],
  ink: "",
  paper: "",
  accent: "",
  action: "",
  actionHover: "",
  displayFont: "",
  primaryFont: "",
  radius: "",
};

export function siteThemeStyle(theme: SiteThemeValue): CSSProperties {
  const style: Record<string, string> = {};
  if (theme.ink) {
    style["--color-ink"] = theme.ink;
    style["--color-background-inverse"] = theme.ink;
    style["--color-text-primary"] = theme.ink;
    style["--color-border-strong"] = theme.ink;
  }
  if (theme.paper) {
    style["--color-background-primary"] = theme.paper;
    style["--color-background-secondary"] = theme.paper;
  }
  if (theme.action) style["--color-action-primary"] = theme.action;
  if (theme.actionHover) style["--color-action-primary-hover"] = theme.actionHover;
  if (theme.accent) {
    style["--color-text-accent"] = theme.accent;
    style["--color-focus"] = theme.accent;
  }
  if (theme.displayFont) style["--font-family-display"] = theme.displayFont;
  if (theme.primaryFont) style["--font-family-primary"] = theme.primaryFont;
  if (theme.radius) {
    style["--border-radius-sm"] = theme.radius;
    style["--border-radius-md"] = theme.radius;
    style["--border-radius-lg"] = theme.radius;
  }
  style["--color-text-inverse"] = "#ffffff";
  return style as CSSProperties;
}

/** Applies one site's design parameters to every Storybook component inside it. */
export function SiteTheme({ theme, children }: { theme: SiteThemeValue; children: ReactNode }) {
  return (
    <div data-site={theme.key} data-locale={theme.locale} style={{ ...siteThemeStyle(theme), width: "100%" }}>
      {children}
    </div>
  );
}
