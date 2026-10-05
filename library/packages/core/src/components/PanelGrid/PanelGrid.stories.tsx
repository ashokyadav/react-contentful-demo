import type { Meta, StoryObj } from "@storybook/react";
import { PanelGrid } from "./PanelGrid";

const photo = (file: string) => `/catalog/${file}`;

const meta: Meta<typeof PanelGrid> = {
  title: "Layout/PanelGrid",
  component: PanelGrid,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Two promo tiles side by side. Each panel needs an \`id\`, \`title\`, \`image\`, \`alt\`, and an \`action\` with a label and href. \`text\` is optional.

Pass \`onNavigate\` when the page should handle the href, such as scrolling to an in-page link. Without it, the action assigns \`window.location\`.

\`\`\`tsx
<PanelGrid
  panels={[
    {
      id: "shirts",
      title: "Simply superior shirts",
      text: "Three shirts, $229.",
      image: shirt,
      alt: "Man in a denim shirt",
      action: { label: "Shop shirts", href: "/clothing/men-apparel?category=shirts" },
    },
  ]}
  onNavigate={(href) => router.push(href)}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof PanelGrid>;

export const FeaturedPanels: Story = {
  args: {
    panels: [
      {
        id: "luxury",
        title: "Layers of luxury",
        text: "Suede, rich wools, and fall-ready cloth.",
        image: photo("Product16.png"),
        alt: "Olive bomber jacket",
        action: { label: "Shop new arrivals", href: "#arrivals" },
      },
      {
        id: "shirts",
        title: "Simply superior shirts",
        text: "Three shirts, $229.",
        image: photo("Product13.png"),
        alt: "Navy polo shirt",
        action: { label: "Shop shirts", href: "/clothing/men-apparel?category=shirts" },
      },
    ],
  },
};
