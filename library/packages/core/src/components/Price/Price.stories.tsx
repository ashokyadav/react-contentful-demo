import type { Meta, StoryObj } from "@storybook/react";
import { Price } from "./Price";

const meta: Meta<typeof Price> = {
  title: "Data Display/Price",
  component: Price,
  parameters: {
    docs: {
      description: {
        component: `
The price on a product page. Pass \`value\` for the amount the shopper pays. Pass \`compareAt\` when that amount is lower than the original price — the original is struck through and screen readers hear both.

Whole amounts omit cents (\`$798\`). Amounts with a fraction keep two digits (\`$598.50\`). \`currency\` defaults to USD.

\`\`\`tsx
<Price value={598.5} compareAt={798} />
<Price value={148} />
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Price>;

export const OnSale: Story = { args: { value: 598.5, compareAt: 798 } };
export const Regular: Story = { args: { value: 148 } };
