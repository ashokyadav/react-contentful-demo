import type { Meta, StoryObj } from "@storybook/react";
import { ProductTile } from "./ProductTile";

const meta: Meta<typeof ProductTile> = {
  title: "Commerce/ProductTile",
  component: ProductTile,
  parameters: {
    docs: {
      description: {
        component: "A linked product card with a photo, price, and optional color swatches. Pass `compareAt` when the price is reduced.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof ProductTile>;

export const Shirt: Story = {
  args: {
    product: {
      title: "Navy polo",
      href: "/product/navy-polo",
      price: 48,
      image: "/catalog/Product13.png",
      alt: "Navy polo shirt",
      fit: "contain",
      swatches: [
        { label: "Chambray", value: "#3d4f6f" },
        { label: "Ivory", value: "#f4f1ea" },
      ],
    },
  },
};
