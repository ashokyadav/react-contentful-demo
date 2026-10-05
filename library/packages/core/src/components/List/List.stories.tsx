import type { Meta, StoryObj } from "@storybook/react";
import { IconCheck } from "@myproject/icons";
import { List, ListItem } from "./List";

const meta: Meta<typeof List> = {
  title: "Data Display/List",
  component: List,
  parameters: {
    docs: {
      description: {
        component: `
\`List\` renders a \`ul\`, or an \`ol\` when \`ordered\` is set. \`variant\` is \`bulleted\`, \`plain\`, or \`divided\`. Plain and divided lists keep list semantics for VoiceOver.

\`ListItem\` can take a \`prefix\` (an icon), a \`suffix\` (a price or status), and a \`description\` under the main text.

\`\`\`tsx
<List variant="divided">
  <ListItem prefix={<IconCheck size="sm" />} suffix="$148" description="Non-iron, slim fit">
    Dress shirt
  </ListItem>
</List>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof List>;

export const Bulleted: Story = {
  render: () => <List><ListItem>Sweat-wicking</ListItem><ListItem>Four-way stretch</ListItem><ListItem>Hidden waistband pocket</ListItem></List>,
};
export const Ordered: Story = {
  render: () => <List ordered><ListItem>Start a return online</ListItem><ListItem>Print the label</ListItem><ListItem>Drop it off</ListItem></List>,
};
export const DividedWithDetail: Story = {
  render: () => (
    <List variant="divided" style={{ maxWidth: 420 }}>
      <ListItem prefix={<IconCheck />} description="Arrives Oct 3" suffix="$0.00">Standard shipping</ListItem>
      <ListItem prefix={<IconCheck />} description="Applied at checkout" suffix="−$20.00">Member discount</ListItem>
    </List>
  ),
};
