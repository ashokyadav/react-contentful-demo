import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Alert } from "./Alert";
import { Button } from "../Button/Button";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  parameters: {
    docs: {
      description: {
        component: `
A message that stays on the page. Pick \`tone\` for the meaning: \`info\`, \`success\`, \`warning\`, or \`error\`.

Leave \`live\` off when the alert is present on load. Set \`live="polite"\` when it appears after an action, and \`live="assertive"\` only for an urgent error. Pass \`onDismiss\` to show a close button, and \`action\` for a follow-up control.

\`\`\`tsx
<Alert tone="warning" title="Only 2 left in size 6">
  <p>Items in your bag aren't reserved.</p>
</Alert>
\`\`\`
        `,
      },
    },
  },
  argTypes: { tone: { control: "inline-radio", options: ["info", "success", "warning", "error"] } },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = { args: { tone: "info", title: "Free shipping on orders over $75", children: <p>Applied automatically at checkout.</p> } };
export const Success: Story = { args: { tone: "success", title: "Your order is confirmed" } };
export const Warning: Story = { args: { tone: "warning", title: "Only 2 left in size 6", children: <p>Items in your bag aren't reserved.</p> } };
export const ErrorAlert: Story = {
  args: { tone: "error", title: "We couldn't process your card", children: <p>Check the card number and expiry date, or try a different payment method.</p>, live: "assertive" },
};
export const Dismissible: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return open ? <Alert {...args} onDismiss={() => setOpen(false)} /> : <Button variant="secondary" onClick={() => setOpen(true)}>Show again</Button>;
  },
  args: { tone: "info", title: "We've updated our return policy" },
};
