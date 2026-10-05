import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, Radio } from "./Radio";

const meta: Meta<typeof RadioGroup> = {
  title: "Core/Radio",
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component: `
Mutually exclusive choices. Always wrap \`Radio\` in \`RadioGroup\` — the group supplies the shared name, keyboard arrows, and the legend that names the question.

Control it with \`defaultValue\` or \`value\` plus \`onChange\`. Put the error on the group, not on an individual radio.

\`\`\`tsx
<RadioGroup legend="Delivery method" name="delivery" defaultValue="standard">
  <Radio value="standard" label="Standard" hint="4–6 business days" />
  <Radio value="express" label="Express" hint="1–2 business days" />
</RadioGroup>
\`\`\`
        `,
      },
    },
  },
  args: { legend: "Delivery method", defaultValue: "standard" },
};
export default meta;
type Story = StoryObj<typeof RadioGroup>;

const options = (
  <>
    <Radio value="standard" label="Standard" hint="3–5 business days, free" />
    <Radio value="express" label="Express" hint="1–2 business days, $20" />
    <Radio value="pickup" label="Pick up in store" hint="Ready in 2 hours" />
  </>
);

export const Default: Story = { render: (args) => <RadioGroup {...args}>{options}</RadioGroup> };
export const Horizontal: Story = {
  render: (args) => (
    <RadioGroup {...args} legend="Colour" orientation="horizontal" defaultValue="black">
      <Radio value="black" label="Black" />
      <Radio value="navy" label="Navy" />
      <Radio value="bone" label="Bone" />
    </RadioGroup>
  ),
};
export const WithError: Story = {
  render: (args) => <RadioGroup {...args} defaultValue="" required error="Choose a delivery method">{options}</RadioGroup>,
};
