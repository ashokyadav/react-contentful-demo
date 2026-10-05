import type { Meta, StoryObj } from "@storybook/react";
import { TextInput } from "./TextInput";

const meta: Meta<typeof TextInput> = {
  title: "Core/TextInput",
  component: TextInput,
  parameters: {
    docs: {
      description: {
        component: `
A single-line field. \`label\` is required and stays visible unless a nearby heading already names the field — then set \`hideLabel\`.

Use \`hint\` for format help and \`error\` after validation fails. Both are connected to the input with \`aria-describedby\`. Pass the native \`type\` and \`autoComplete\` so browsers and password managers can fill it.

\`\`\`tsx
<TextInput label="Email address" type="email" autoComplete="email" required />
<TextInput label="Gift card" error="Enter a 16-digit code" />
\`\`\`
        `,
      },
    },
  },
  args: { label: "Email address", type: "email", autoComplete: "email" },
};
export default meta;
type Story = StoryObj<typeof TextInput>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "We'll send your order confirmation here." } };
export const Required: Story = { args: { required: true } };
export const WithError: Story = {
  args: { required: true, defaultValue: "ak@", error: "Enter an email address in the format name@example.com" },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "ak@example.com" } };
export const HiddenLabel: Story = {
  args: { label: "Search products", hideLabel: true, type: "search", placeholder: "Search" },
};
