import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Core/Toggle",
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component: `
A switch for a setting that takes effect immediately. Do not use it inside a form that needs a submit button — use \`Checkbox\` there.

\`label\` is required and should describe the setting, not the current state ("Show sold-out items", not "On"). Control it with \`defaultChecked\` or \`checked\` and \`onChange\`. \`labelPosition="end"\` puts the switch first.

\`\`\`tsx
<Toggle label="Show sold-out items" checked={show} onChange={setShow} />
\`\`\`
        `,
      },
    },
  },
  args: { label: "Show sold-out items" },
};
export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const WithHint: Story = { args: { label: "Order updates by text", hint: "Standard message rates apply" } };
export const LabelAfter: Story = { args: { labelPosition: "end" } };
export const Disabled: Story = { args: { disabled: true } };
