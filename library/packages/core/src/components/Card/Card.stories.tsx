import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { Image } from "../Image/Image";
import { Tag } from "../Tag/Tag";
import { Button } from "../Button/Button";
import { Grid } from "../Layout/Layout";

const img = "/catalog/Product13.png";
const meta: Meta<typeof Card> = {
  title: "Data Display/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component: `
A product or editorial tile. \`title\` is required and is a heading — set \`headingLevel\` so it fits the page outline (usually \`3\` under a section \`h2\`).

Pass \`href\` to make the whole card one link. The title is that link; anything else interactive, such as a button in \`footer\`, stays its own control. \`eyebrow\` is a small label above the title. \`variant\` is \`plain\`, \`outlined\`, or \`filled\`.

\`\`\`tsx
<Card href="/shirts/non-iron" eyebrow="New arrivals" title="Non-Iron Dress Shirt" media={<Image src={src} decorative aspectRatio="4/5" />}>
  <p>$148</p>
</Card>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const ProductTile: Story = {
  args: {
    href: "#product",
    title: "Non-Iron Dress Shirt",
    eyebrow: "New arrivals",
    media: <Image src={img} decorative aspectRatio="4/5" />,
    children: <p>$148</p>,
  },
  render: (args) => <div style={{ maxWidth: 280 }}><Card {...args} /></div>,
};
export const Outlined: Story = {
  args: {
    variant: "outlined",
    title: "Hemming, on us",
    children: <p>Bring any pant to a store and we will hem it, usually within 48 hours.</p>,
    footer: <Button variant="secondary" size="sm">Find a store</Button>,
  },
  render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div>,
};
export const Filled: Story = {
  args: { variant: "filled", title: "Rewards", children: <p>Earn up to 10× rewards and an extra 10% off.</p>, footer: <Tag>Members</Tag> },
  render: (args) => <div style={{ maxWidth: 360 }}><Card {...args} /></div>,
};
export const ProductGrid: Story = {
  render: () => (
    <Grid as="ul" columns={{ base: 2, md: 4 }} gap="lg">
      {["Dress Shirt", "Sport Coat", "Chino", "Polo"].map((t) => (
        <li key={t}><Card href="#" title={t} media={<Image src={img} decorative aspectRatio="4/5" />}><p>$98</p></Card></li>
      ))}
    </Grid>
  ),
};
