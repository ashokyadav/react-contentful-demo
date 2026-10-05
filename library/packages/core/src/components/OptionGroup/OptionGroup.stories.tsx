import type { Meta, StoryObj } from "@storybook/react";
import { OptionGroup } from "./OptionGroup";

const meta: Meta<typeof OptionGroup> = {
  title: "Form/OptionGroup",
  component: OptionGroup,
  parameters: {
    docs: {
      description: {
        component: `
A single choice shown as chips, for the options on a product page. Text chips are sizes. A \`swatch\` color renders a color chip, and the legend shows the selected name ("Color: Brown").

These are native radios, so arrow keys move between options in the group. Use \`placeholder\` for the empty state ("Select chest"). Pass \`error\` when the shopper tries to add the item before choosing.

Use \`RadioGroup\` instead when the options are sentences, such as ship-to-me versus store pickup.

\`\`\`tsx
<OptionGroup
  legend="Color"
  defaultValue="brown"
  options={[
    { value: "brown", label: "Brown", swatch: "#6b4f3a" },
    { value: "navy", label: "Navy", swatch: "#001f36" },
  ]}
/>
<OptionGroup legend="Chest" placeholder="Select chest" required options={chestSizes} />
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof OptionGroup>;

const chest = ["36", "38", "39", "40", "41", "42", "44", "46"].map((n) => ({ value: n, label: n }));

export const Color: Story = {
  args: {
    legend: "Color",
    defaultValue: "brown",
    options: [
      { value: "brown", label: "Brown", swatch: "#6b4f3a" },
      { value: "navy", label: "Navy", swatch: "#001f36" },
      { value: "grey", label: "Grey", swatch: "#8a8680" },
      { value: "black", label: "Black", swatch: "#1a1a1a" },
    ],
  },
};

export const ChestSize: Story = {
  args: { legend: "Chest", placeholder: "Select chest", required: true, options: chest },
};

export const Length: Story = {
  args: {
    legend: "Length",
    placeholder: "Select length",
    options: [
      { value: "short", label: "Short" },
      { value: "regular", label: "Regular" },
      { value: "long", label: "Long" },
    ],
  },
};

export const WithError: Story = {
  args: { ...ChestSize.args, error: "Select a chest size" },
};
