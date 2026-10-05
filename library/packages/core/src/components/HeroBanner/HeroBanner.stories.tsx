import type { Meta, StoryObj } from "@storybook/react";
import { HeroBanner } from "./HeroBanner";

const meta: Meta<typeof HeroBanner> = {
  title: "Commerce/HeroBanner",
  component: HeroBanner,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof HeroBanner>;

export const FriendsAndFamily: Story = {
  args: {
    kicker: "The Friends & Family Event",
    offer: "25% off sitewide*",
    note: "Plus an extra 10% off for Online Store Example3 Rewards members",
    fine: "*Exclusions apply",
    details: "View details",
    image: "/catalog/home-front3.png",
    imageAlt: "Cream gift boxes and a shopping bag on a marble table",
    actions: [
      { label: "Shop men", href: "#catalog" },
      { label: "Shop women", href: "#stories" },
    ],
  },
};
