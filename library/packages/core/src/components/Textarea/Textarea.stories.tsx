import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Core/Textarea",
  component: Textarea,
  parameters: {
    docs: {
      description: {
        component: `
A multi-line field with the same \`label\`, \`hint\`, and \`error\` contract as \`TextInput\`.

Set \`maxLength\` and \`showCount\` when the length matters. The count is announced only when the writer is within 20 characters of the limit, so it does not chatter on every keystroke.

\`\`\`tsx
<Textarea label="Gift message" maxLength={200} showCount rows={4} />
\`\`\`
        `,
      },
    },
  },
  args: { label: "Tell us about the fit", hint: "What size did you order, and how did it feel?" },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
export const WithCharacterCount: Story = { args: { showCount: true, maxLength: 200 } };
export const WithError: Story = { args: { required: true, error: "Write at least 20 characters so other shoppers can use your review" } };
