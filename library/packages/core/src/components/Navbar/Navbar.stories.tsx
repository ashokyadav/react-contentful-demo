import type { Meta, StoryObj } from "@storybook/react";
import { IconBag, IconSearch, IconUser } from "@myproject/icons";
import { Navbar } from "./Navbar";

const meta: Meta<typeof Navbar> = {
  title: "Navigation/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The store header. The announcement bar sits on top, the wordmark is centered between \`start\` (search) and \`actions\`, and department links go on the row below. Pass \`navigation\` for a mega menu.

\`\`\`tsx
<Navbar
  banner={<span>25% off sitewide</span>}
  bannerLeading={<a href="/rewards">Rewards</a>}
  brand={<a href="/">Online Store Example3</a>}
  links={[{ label: "Men", href: "/men", current: true }, { label: "Women", href: "/women" }]}
  actions={<a href="/bag">Bag</a>}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Navbar>;

const iconLink = (label: string, icon: React.ReactNode) => (
  <a href="#" style={{ display: "grid", placeItems: "center", width: 44, height: 44 }}>
    {icon}<span className="visually-hidden">{label}</span>
  </a>
);

export const Default: Story = {
  args: {
    banner: <span>25% off sitewide · Shop men · Shop women</span>,
    bannerLeading: <a href="#rewards">Online Store Example3 Rewards</a>,
    brand: <a href="#" style={{ textDecoration: "none", color: "inherit" }}>Online Store Example3</a>,
    links: [
      { label: "Men", href: "#men", current: true },
      { label: "Shirts", href: "#shirts" },
      { label: "Suits", href: "#suits" },
      { label: "Women", href: "#women" },
      { label: "Boys", href: "#boys" },
      { label: "Sale", href: "#sale" },
    ],
    actions: (<>{iconLink("Search", <IconSearch />)}{iconLink("Account", <IconUser />)}{iconLink("Bag, 2 items", <IconBag />)}</>),
  },
};
export const Mobile: Story = { ...Default, parameters: { viewport: { defaultViewport: "mobile1" } } };
