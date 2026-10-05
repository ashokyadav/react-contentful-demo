import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../Button/Button";
import { SiteTheme, type SiteThemeValue } from "./SiteTheme";

const sample: SiteThemeValue = {
  key: "example",
  name: "Example",
  locale: "en-us",
  locales: ["en-us"],
  ink: "#142033",
  paper: "#ffffff",
  accent: "#5c4a22",
  action: "#142033",
  actionHover: "#24344a",
  displayFont: "Georgia, serif",
  primaryFont: "Arial, Helvetica, sans-serif",
  radius: "0",
};

const meta: Meta<typeof SiteTheme> = {
  title: "Layout/SiteTheme",
  component: SiteTheme,
  parameters: {
    docs: {
      description: {
        component: "Wraps components with the theme from the active Contentstack site. The Storybook site toolbar loads those sites from the storefront.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SiteTheme>;

export const Example: Story = {
  args: {
    theme: sample,
    children: (
      <div style={{ padding: "2rem" }}>
        <p style={{ fontFamily: "var(--font-family-display)", fontSize: "2.5rem", margin: "0 0 1rem" }}>Example</p>
        <Button>Shop now</Button>
      </div>
    ),
  },
};
