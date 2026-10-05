import type { Meta, StoryObj } from "@storybook/react";
import { ProductRow } from "./ProductRow";

const photo = (file: string) => `/catalog/${file}`;

const meta: Meta<typeof ProductRow> = {
  title: "Commerce/ProductRow",
  component: ProductRow,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof ProductRow>;

export const Catalog: Story = {
  args: {
    id: "catalog",
    label: "New arrivals",
    products: [
      { title: "Bomber jacket", href: "/product/bomber-jacket", price: 168, image: photo("Product16.png"), alt: "Olive bomber jacket" },
      { title: "Navy polo", href: "/product/navy-polo", price: 48, image: photo("Product13.png"), alt: "Navy polo shirt", fit: "contain" },
      { title: "Bifold wallet", href: "/product/bifold-wallet", price: 78, image: photo("Product12.png"), alt: "Brown leather bifold wallet", fit: "contain" },
    ],
  },
};
