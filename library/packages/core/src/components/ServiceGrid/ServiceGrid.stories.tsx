import type { Meta, StoryObj } from "@storybook/react";
import { ServiceGrid } from "./ServiceGrid";

const photo = (file: string) => `/catalog/${file}`;

const meta: Meta<typeof ServiceGrid> = {
  title: "Commerce/ServiceGrid",
  component: ServiceGrid,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof ServiceGrid>;

export const Services: Story = {
  args: {
    id: "stories",
    label: "Services",
    stories: [
      { title: "Here to help", text: "Personal shopping, alterations, and gifting.", image: photo("Product11.png"), alt: "Sand leather satchel", href: "#stories" },
      { title: "Crafted just for you", text: "Tailoring cut to your measurements, with hundreds of cloths.", image: photo("Product16.png"), alt: "Olive bomber jacket", href: "#stories" },
      { title: "Visit", text: "Associates who know the fit, in the store.", image: photo("Product19.png"), alt: "Sapphire drop jewelry", href: "#stories" },
    ],
  },
};
