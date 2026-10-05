import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      description: {
        component: `
Switch between panels in the same view. \`label\` names the tab list. Each item needs a stable \`id\`, a \`label\`, and \`content\`.

Arrow keys move between tabs. \`activation="automatic"\` (the default) shows the panel as focus moves. Use \`"manual"\` when a panel is expensive to render — the user then presses Enter or Space to select it. Control the selection with \`value\` and \`onChange\`, or leave it uncontrolled with \`defaultValue\`.

\`\`\`tsx
<Tabs
  label="Product details"
  items={[
    { id: "fit", label: "Fit", content: <p>Slim through the waist.</p> },
    { id: "fabric", label: "Fabric", content: <p>100% cotton.</p> },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

const items = [
  { id: "details", label: "Details", content: <p>Four-way stretch, sweat-wicking fabric with a secure zip pocket.</p> },
  { id: "fit", label: "Fit", content: <p>Designed for a close fit. Size up for more room.</p> },
  { id: "care", label: "Care", content: <p>Machine wash cold. Tumble dry low.</p> },
  { id: "reviews", label: "Reviews (0)", content: <p>No reviews yet.</p>, disabled: true },
];

export const Automatic: Story = { args: { label: "Product information", items } };
export const Manual: Story = { args: { label: "Product information", items, activation: "manual" } };
