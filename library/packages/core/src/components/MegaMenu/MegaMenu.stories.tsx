import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { IconBag, IconSearch, IconUser } from "@myproject/icons";
import { Navbar } from "../Navbar/Navbar";
import { MegaMenu } from "./MegaMenu";
import { departmentMenus } from "./departmentMenus";

const meta: Meta<typeof MegaMenu> = {
  title: "Navigation/Mega menu",
  component: MegaMenu,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A department bar that opens a full-width panel. Give each item \`columns\` of links and optional \`features\` (image plus label).

Put it in the Navbar \`navigation\` slot. Hover or focus a department to open its panel. The first click opens the panel; the next click follows \`href\`. Escape dismisses it.

\`\`\`tsx
<Navbar
  brand={<a href="/">Online Store Example3</a>}
  navigation={<MegaMenu items={departmentMenus} />}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof MegaMenu>;

const iconLink = (label: string, icon: ReactNode) => (
  <a href="#bag" style={{ display: "grid", placeItems: "center", width: 44, height: 44, color: "inherit" }}>
    {icon}
    <span className="visually-hidden">{label}</span>
  </a>
);

function Header({ open }: { open?: string | null }) {
  return (
    <Navbar
      banner={<a href="#sale">25% off sitewide</a>}
      brand={<a href="#home" style={{ color: "inherit", textDecoration: "none" }}>Online Store Example3</a>}
      navigation={<MegaMenu items={departmentMenus} defaultValue={open} />}
      actions={(
        <>
          {iconLink("Search", <IconSearch />)}
          {iconLink("Account", <IconUser />)}
          {iconLink("Bag, 1 item", <IconBag />)}
        </>
      )}
    />
  );
}

export const Closed: Story = { render: () => <Header /> };

export const MenOpen: Story = {
  render: () => (
    <div style={{ minHeight: 720 }}>
      <Header open="men" />
    </div>
  ),
  parameters: { docs: { description: { story: "Men’s panel: clothing, accessories, featured shops, and two tiles." } } },
};
