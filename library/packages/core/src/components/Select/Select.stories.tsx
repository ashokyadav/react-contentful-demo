import type { Meta, StoryObj } from "@storybook/react";
import { Select } from "./Select";

const sizes = ["0", "2", "4", "6", "8", "10", "12"].map((v) => ({ value: v, label: v }));

const meta: Meta<typeof Select> = {
  title: "Core/Select",
  component: Select,
  parameters: {
    docs: {
      description: {
        component: `
A native \`<select>\`. Prefer it over a custom menu: it works with screen readers, mobile pickers, and voice control.

\`options\` is a flat list, or \`{ group, options }\` for \`<optgroup>\`. \`placeholder\` inserts an empty first option such as "Select a size". Mark an option \`disabled\` when that size is sold out but should stay visible.

\`\`\`tsx
<Select
  label="Size"
  placeholder="Select a size"
  required
  options={[{ value: "m", label: "Medium" }, { value: "l", label: "Large", disabled: true }]}
/>
\`\`\`
        `,
      },
    },
  },
  args: { label: "Size", placeholder: "Select a size", options: sizes },
};
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {};
export const WithUnavailableOption: Story = {
  args: { options: sizes.map((o) => (o.value === "6" ? { ...o, label: "6 (sold out)", disabled: true } : o)) },
};
export const Grouped: Story = {
  args: {
    label: "Ship to",
    placeholder: "Select a country",
    options: [
      { group: "North America", options: [{ value: "us", label: "United States" }, { value: "ca", label: "Canada" }] },
      { group: "Asia Pacific", options: [{ value: "in", label: "India" }, { value: "au", label: "Australia" }] },
    ],
  },
};
export const WithError: Story = { args: { required: true, error: "Select a size to add this item to your bag" } };
