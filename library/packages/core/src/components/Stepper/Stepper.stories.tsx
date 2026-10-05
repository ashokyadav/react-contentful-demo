import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "./Stepper";

const meta: Meta<typeof Stepper> = {
  title: "Navigation/Stepper",
  component: Stepper,
  parameters: {
    docs: {
      description: {
        component: `
Progress through a short sequence such as checkout. \`current\` is the zero-based index of the active step. Completed steps can include \`href\` so the shopper can go back; the current and upcoming steps are not links.

\`label\` names the navigation landmark. Pass \`linkComponent\` when those links should be your router link.

\`\`\`tsx
<Stepper
  current={1}
  steps={[
    { label: "Bag", href: "/bag" },
    { label: "Shipping" },
    { label: "Payment" },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
export const Checkout: StoryObj<typeof Stepper> = {
  args: {
    current: 1,
    steps: [{ label: "Shipping", href: "#shipping" }, { label: "Payment" }, { label: "Review" }, { label: "Confirmation" }],
  },
  argTypes: { current: { control: { type: "range", min: 0, max: 3 } } },
};
