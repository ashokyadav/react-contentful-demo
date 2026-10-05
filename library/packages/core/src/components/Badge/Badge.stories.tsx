import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IconBag } from "@myproject/icons";
import { Badge } from "./Badge";
import { Tag } from "../Tag/Tag";
import { Flex } from "../Layout/Layout";

const meta: Meta<typeof Badge> = {
  title: "Data Display/Badge & Tag",
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: `
**Badge** labels a status or a count. \`tone\` is \`neutral\`, \`info\`, \`success\`, \`warning\`, \`error\`, or \`sale\`. For a bag count, pass \`count\` instead of children — the bubble is visual only, so the parent link still needs a name such as "Bag, 2 items". Counts above \`max\` (default 99) render as "99+".

**Tag** is a filter or attribute. \`children\` is the text. Pass \`onRemove\` to add a button named "Remove {text}", for an applied filter the shopper can clear.

\`\`\`tsx
<Badge tone="sale">25% off</Badge>
<a href="/bag">Bag <Badge count={2} /></a>

<Tag>Non-iron</Tag>
<Tag onRemove={() => clear("navy")}>Navy</Tag>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Badge>;

export const Tones: Story = {
  render: () => (
    <Flex gap="xs" wrap>
      <Badge>Neutral</Badge><Badge tone="info">New</Badge><Badge tone="success">In stock</Badge>
      <Badge tone="warning">Low stock</Badge><Badge tone="error">Sold out</Badge><Badge tone="sale">Sale</Badge>
    </Flex>
  ),
};
export const CountOnIcon: Story = {
  render: () => (
    <a href="#" style={{ position: "relative", display: "inline-grid", placeItems: "center", width: 44, height: 44 }}>
      <IconBag />
      <Badge count={3} style={{ position: "absolute", top: 4, right: 2 }} />
      <span className="visually-hidden">Bag, 3 items</span>
    </a>
  ),
};
export const RemovableTags: StoryObj = {
  render: () => {
    const [tags, setTags] = useState(["Black", "Size 6", "Under $100"]);
    return (
      <div>
        <p id="active-filters">Active filters</p>
        <Flex as="ul" gap="xs" wrap aria-labelledby="active-filters" style={{ listStyle: "none", padding: 0 }}>
          {tags.map((t) => <li key={t}><Tag onRemove={() => setTags(tags.filter((x) => x !== t))}>{t}</Tag></li>)}
        </Flex>
      </div>
    );
  },
};
