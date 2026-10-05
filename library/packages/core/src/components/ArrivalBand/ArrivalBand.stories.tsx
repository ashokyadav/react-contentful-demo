import type { Meta, StoryObj } from "@storybook/react";
import { ArrivalBand } from "./ArrivalBand";

const photo = (file: string) => `/catalog/${file}`;

const meta: Meta<typeof ArrivalBand> = {
  title: "Commerce/ArrivalBand",
  component: ArrivalBand,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof ArrivalBand>;

export const NewArrivals: Story = {
  args: {
    id: "arrivals",
    title: "All new, for you",
    text: "The latest of the season, ready to wear now.",
    action: { label: "Shop new arrivals", href: "#catalog" },
    products: [
      { title: "Navy polo", href: "/product/navy-polo", price: 48, image: photo("Product13.png"), alt: "Navy polo shirt", fit: "contain", swatches: [{ label: "Navy", value: "#1e3a5f" }] },
      { title: "Leather satchel", href: "/product/leather-satchel", price: 168, image: photo("Product11.png"), alt: "A leather satchel", fit: "contain", swatches: [{ label: "Sand", value: "#d9cbb8" }] },
      { title: "Court sneakers", href: "/product/court-sneakers", price: 98, image: photo("Product15.png"), alt: "Grey court sneakers", fit: "contain", swatches: [{ label: "Grey", value: "#c8c4be" }] },
    ],
  },
};
