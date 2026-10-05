import type { Meta, StoryObj } from "@storybook/react";
import { QuantityInput } from "./QuantityInput";

const meta: Meta<typeof QuantityInput> = {
  title: "Form/QuantityInput",
  component: QuantityInput,
  args: { defaultValue: 3, min: 1, max: 10 },
  parameters: {
    docs: {
      description: {
        component: `
The quantity stepper on a product page: decrease, a number the shopper can type, and increase.

\`min\` defaults to 1. Set \`max\` when stock is capped — the plus button disables at the cap. Control it with \`value\` and \`onChange\`, or leave it uncontrolled with \`defaultValue\`.

Pressing plus or minus announces the new quantity. Typing in the field does not, because the input already reports its own value.

\`\`\`tsx
<QuantityInput label="Quantity" defaultValue={3} min={1} max={10} />
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof QuantityInput>;

export const Default: Story = {};
export const AtMinimum: Story = { args: { defaultValue: 1 } };
export const Disabled: Story = { args: { disabled: true } };
