import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast } from "./Toast";
import { Button } from "../Button/Button";
import { Flex } from "../Layout/Layout";

const meta: Meta = {
  title: "Feedback/Toast",
  decorators: [(Story) => <ToastProvider><Story /></ToastProvider>],
  parameters: {
    docs: {
      description: {
        component: `
A temporary confirmation. Wrap the app once in \`ToastProvider\`, then call \`useToast()\` from any child.

\`show({ message, tone })\` adds a toast. \`tone\` is \`info\`, \`success\`, \`warning\`, or \`error\`. Success and info dismiss after 6 seconds; errors stay until dismissed so they are not missed. The timer pauses while the pointer or keyboard focus is on the toast. \`action\` adds a button such as Undo.

\`useToast\` throws if it is rendered outside the provider.

\`\`\`tsx
const { show } = useToast();
show({ tone: "success", message: "Added to bag" });
show({ tone: "error", message: "Couldn't save the address", action: { label: "Retry", onClick: retry } });
\`\`\`
        `,
      },
    },
  },
};
export default meta;

function Demo() {
  const { show } = useToast();
  return (
    <Flex gap="sm" wrap>
      <Button onClick={() => show({ tone: "success", message: "Added to bag", action: { label: "View bag", onClick: () => undefined } })}>Add to bag</Button>
      <Button variant="secondary" onClick={() => show({ tone: "info", message: "Saved to your wish list" })}>Save item</Button>
      <Button variant="danger" onClick={() => show({ tone: "error", message: "Couldn't update quantity. Try again." })}>Trigger error</Button>
    </Flex>
  );
}
export const Default: StoryObj = { render: () => <Demo /> };
