import type { Meta, StoryObj } from "@storybook/react";
import { SwatchPicker } from "./SwatchPicker";

const meta: Meta<typeof SwatchPicker> = {
  title: "Commerce/SwatchPicker",
  component: SwatchPicker,
  parameters: {
    docs: {
      description: {
        component: "Color choices for a product. \`value\` is the selected CSS color. \`label\` is the color name announced to assistive technology.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof SwatchPicker>;

export const Colors: Story = {
  args: {
    label: "Color",
    value: "#3d4f6f",
    options: [
      { label: "Chambray", value: "#3d4f6f" },
      { label: "Ivory", value: "#f4f1ea" },
    ],
  },
};
