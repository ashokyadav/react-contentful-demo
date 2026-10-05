import type { Meta, StoryObj } from "@storybook/react";
import { IconBag } from "@myproject/icons";
import { Navbar } from "../Navbar/Navbar";
import { departmentMenus } from "../MegaMenu/departmentMenus";
import { MobileMenu } from "./MobileMenu";

const meta: Meta<typeof MobileMenu> = {
  title: "Navigation/Mobile menu",
  component: MobileMenu,
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        component: `
The phone header: a menu button, centered wordmark, and actions. The department row and search field stay on wider screens.

The menu is a full-screen \`Modal\`. A department opens its links; Back returns to the list.

\`\`\`tsx
<Navbar
  brand={<a href="/">Online Store Example3</a>}
  menu={<MobileMenu items={departmentMenus} />}
  navigation={<MegaMenu items={departmentMenus} />}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof MobileMenu>;

function Header({ open }: { open?: boolean }) {
  return (
    <Navbar
      banner={<span>25% off sitewide</span>}
      bannerLeading={<a href="#rewards">Online Store Example3 Rewards</a>}
      brand={<a href="#home" style={{ color: "inherit", textDecoration: "none" }}>Online Store Example3</a>}
      menu={<MobileMenu items={departmentMenus} defaultOpen={open} />}
      actions={(
        <a href="#bag" style={{ display: "grid", placeItems: "center", width: 44, height: 44, color: "inherit" }}>
          <IconBag />
          <span className="visually-hidden">Bag</span>
        </a>
      )}
    />
  );
}

export const Closed: Story = { render: () => <Header /> };
export const Open: Story = { render: () => <Header open /> };
