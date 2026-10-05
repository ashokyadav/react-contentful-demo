import type { Meta, StoryObj } from "@storybook/react";
import { FeatureBand } from "./FeatureBand";

const photo = (file: string) => `/catalog/${file}`;

const meta: Meta<typeof FeatureBand> = {
  title: "Commerce/FeatureBand",
  component: FeatureBand,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof FeatureBand>;

export const FallCollection: Story = {
  args: {
    id: "feature",
    title: "Fall collection",
    text: "A look at the season’s tailoring.",
    action: { label: "Shop fall looks", href: "#stories" },
    images: [
      { src: photo("Product16.png"), alt: "Olive bomber jacket" },
      { src: photo("Product13.png"), alt: "Navy polo shirt" },
      { src: photo("Product11.png"), alt: "Sand leather satchel" },
      { src: photo("Product18.png"), alt: "Blush wrap dress" },
    ],
  },
};
