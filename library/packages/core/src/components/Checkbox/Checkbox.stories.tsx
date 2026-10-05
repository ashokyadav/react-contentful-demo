import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Core/Checkbox",
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component: `
An independent yes or no. Use a radio group when the choices exclude each other.

\`label\` is required. \`hint\` and \`error\` are announced with the box. Set \`indeterminate\` on a "select all" box when only some rows are selected. The input accepts the usual checkbox props (\`checked\`, \`defaultChecked\`, \`onChange\`, \`disabled\`).

\`\`\`tsx
<Checkbox label="Email me about new arrivals" hint="About two emails a month." />
<Checkbox label="Select all" indeterminate={someSelected} checked={allSelected} onChange={toggleAll} />
\`\`\`
        `,
      },
    },
  },
  args: { label: "Email me about new arrivals" },
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "About two emails a month. Unsubscribe anytime." } };
export const WithError: Story = { args: { label: "I accept the terms of sale", error: "Accept the terms of sale to place your order" } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const SelectAll: Story = {
  render: () => {
    const items = ["Tops", "Pants", "Accessories"];
    const [checked, setChecked] = useState<string[]>(["Tops"]);
    const all = checked.length === items.length;
    return (
      <fieldset style={{ border: 0, padding: 0 }}>
        <legend>Filter by category</legend>
        <Checkbox
          label="All categories"
          checked={all}
          indeterminate={!all && checked.length > 0}
          onChange={() => setChecked(all ? [] : items)}
        />
        <div style={{ paddingLeft: 32 }}>
          {items.map((i) => (
            <Checkbox key={i} label={i} checked={checked.includes(i)}
              onChange={(e) => setChecked(e.target.checked ? [...checked, i] : checked.filter((c) => c !== i))} />
          ))}
        </div>
      </fieldset>
    );
  },
};
