import type { Meta, StoryObj } from "@storybook/react";
import { Gallery } from "./Gallery";

const u = (file: string) => `/catalog/${file}`;
const meta: Meta<typeof Gallery> = {
  title: "Media/Gallery",
  component: Gallery,
  parameters: {
    docs: {
      description: {
        component: `
A product gallery: one large image and a row of thumbnail buttons. \`label\` names the group ("Product images"). Every image needs an \`alt\`; \`thumbnail\` is optional and falls back to \`src\`.

Arrow keys move between thumbnails. The selected thumbnail is announced, and a live region announces which image is showing.

\`\`\`tsx
<Gallery
  label="Product images"
  images={[
    { src: front, alt: "Navy shirt, front" },
    { src: back, alt: "Navy shirt, back" },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Gallery>;

export const ProductGallery: Story = {
  args: {
    label: "Product images",
    images: [
      { src: u("Product16.png"), alt: "Olive bomber jacket" },
      { src: u("Product17.png"), alt: "Blush pointed heels" },
      { src: u("Product18.png"), alt: "Blush wrap dress" },
    ],
  },
  render: (args) => <div style={{ maxWidth: 560 }}><Gallery {...args} /></div>,
};
