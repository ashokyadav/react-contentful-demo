import type { Meta, StoryObj } from "@storybook/react";
import { IconInfo } from "@myproject/icons";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button/Button";

const meta: Meta<typeof Tooltip> = {
  title: "Data Display/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Extra text for a control, shown on hover and keyboard focus. The child must be one focusable element (a button or a link). The tooltip is tied to it with \`aria-describedby\`.

Do not put required instructions or anything clickable in a tooltip — people who tap, and people who never hover, will miss it. Escape dismisses it, and the pointer can move onto the text without it closing.

\`\`\`tsx
<Tooltip content="Prices are in US dollars">
  <Button variant="tertiary">Currency</Button>
</Tooltip>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Tooltip>;

export const OnButton: Story = {
  render: () => (
    <Tooltip content="We'll hold it for 60 minutes">
      <Button variant="secondary">Reserve in store</Button>
    </Tooltip>
  ),
};
export const InfoIcon: Story = {
  render: () => (
    <p style={{ display: "flex", alignItems: "center", gap: 4 }}>
      Estimated tax
      <Tooltip content="Final tax is calculated from your shipping address." placement="bottom">
        <button type="button" style={{ all: "unset", display: "grid", placeItems: "center", width: 32, height: 32, cursor: "pointer" }}>
          <IconInfo size="sm" /><span className="visually-hidden">About estimated tax</span>
        </button>
      </Tooltip>
    </p>
  ),
};
