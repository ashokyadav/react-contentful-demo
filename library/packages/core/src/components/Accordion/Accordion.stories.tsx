import type { Meta, StoryObj } from "@storybook/react";
import { Accordion } from "./Accordion";

const items = [
  {
    id: "details",
    title: "Product details & care",
    content: (
      <>
        <p>Unlined wool jacket with a 3-button front, side vents, and patch pockets. Classic fit. Dry clean. Imported.</p>
        <p>Item no. MK01414</p>
      </>
    ),
  },
  {
    id: "shipping",
    title: "Shipping & returns",
    content: <p>Standard shipping arrives in 3 to 7 business days. Returns are accepted for 60 days. Made-on-demand sizes cannot be returned.</p>,
  },
];

const meta: Meta<typeof Accordion> = {
  title: "Data Display/Accordion",
  component: Accordion,
  args: { items, defaultValue: ["details"] },
  parameters: {
    docs: {
      description: {
        component: `
Stacked sections that open and close, such as product details and shipping policy. Each title is a button. A closed panel is hidden from everyone, including screen readers.

\`multiple\` (the default) lets more than one section stay open. Set it to \`false\` when only one answer should show at a time. \`defaultValue\` is the list of ids that start open.

\`\`\`tsx
<Accordion
  defaultValue={["details"]}
  items={[
    { id: "details", title: "Product details & care", content: <p>Unlined wool. Dry clean.</p> },
    { id: "shipping", title: "Shipping & returns", content: <p>Returns accepted for 60 days.</p> },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const ProductDetails: Story = {};
export const SingleOpen: Story = { args: { multiple: false, defaultValue: ["details"] } };
