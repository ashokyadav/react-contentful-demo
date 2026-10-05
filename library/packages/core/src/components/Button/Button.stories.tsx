import type { Meta, StoryObj } from "@storybook/react";
import { IconBag, IconChevronRight } from "@myproject/icons";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Core/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component: `
Use one \`primary\` button for the main action in a view. \`secondary\` is the alternative, \`tertiary\` is a text link, and \`danger\` confirms something destructive.

Set \`type="submit"\` inside a form. Pass \`loading\` while the action is in flight — the button stays focused and ignores further clicks. \`iconStart\` and \`iconEnd\` are decorative; the button name is the text.

\`\`\`tsx
<Button variant="primary" iconStart={<IconBag size="sm" />}>Add to bag</Button>
<Button variant="secondary" type="button">Save for later</Button>
<Button variant="tertiary">View size guide</Button>
\`\`\`
        `,
      },
    },
  },
  args: { children: "Add to bag", variant: "primary", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "tertiary", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary", children: "Save for later" } };
export const Tertiary: Story = { args: { variant: "tertiary", children: "View size guide" } };
export const Danger: Story = { args: { variant: "danger", children: "Remove item" } };
export const WithIcons: Story = {
  args: { iconStart: <IconBag size="sm" />, iconEnd: <IconChevronRight size="sm" />, children: "Checkout" },
};
export const Loading: Story = { args: { loading: true, loadingLabel: "Adding to bag" } };
export const Disabled: Story = { args: { disabled: true } };
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};
