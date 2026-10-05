import type { Meta, StoryObj } from "@storybook/react";
import { FormField, Label, ErrorMessage, fieldControlProps } from "./FormField";
import s from "./FormField.module.scss";

const meta: Meta<typeof FormField> = {
  title: "Form/FormField",
  component: FormField,
  parameters: {
    docs: {
      description: {
        component: `
The wrapper behind \`TextInput\`, \`Select\`, and \`Textarea\`. Use it directly when the control is custom.

\`label\` is required. \`hint\` and \`error\` are associated with the control. Render the control as a function child and spread \`fieldControlProps(ctx)\` onto it — that sets \`id\`, \`aria-describedby\`, \`aria-invalid\`, and \`aria-required\`.

\`Label\` and \`ErrorMessage\` can also stand alone. \`Label hidden\` keeps the name for assistive tech when the design shows the name somewhere else.

\`\`\`tsx
<FormField label="Monogram" hint="Up to three letters" error={error}>
  {(ctx) => <input className={controlClass} {...fieldControlProps(ctx)} />}
</FormField>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof FormField>;

export const WithCustomControl: Story = {
  render: () => (
    <FormField label="Gift message" hint="Up to 120 characters" required>
      {(ctx) => <input className={s.control} maxLength={120} {...fieldControlProps(ctx)} />}
    </FormField>
  ),
};

export const WithError: Story = {
  render: () => (
    <FormField label="Postal code" error="Enter a 5-digit ZIP code, like 75024">
      {(ctx) => <input className={s.control} inputMode="numeric" defaultValue="750" {...fieldControlProps(ctx)} />}
    </FormField>
  ),
};

export const LabelStandalone: StoryObj<typeof Label> = {
  render: () => <Label required>Email address</Label>,
};

export const ErrorMessageStandalone: StoryObj<typeof ErrorMessage> = {
  render: () => <ErrorMessage>Select a size before adding to bag</ErrorMessage>,
};
