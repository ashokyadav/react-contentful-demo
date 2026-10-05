import type { Meta, StoryObj } from "@storybook/react";
import { Navbar } from "../Navbar/Navbar";
import { AccountMenu } from "./AccountMenu";

const meta: Meta<typeof AccountMenu> = {
  title: "Navigation/Account menu",
  component: AccountMenu,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
A panel under the account icon: sign in, create an account, rewards, wishlist, and order tracking.

\`\`\`tsx
<Navbar
  brand={<a href="/">Online Store Example3</a>}
  actions={<AccountMenu />}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof AccountMenu>;

export const Closed: Story = {
  render: () => (
    <Navbar
      brand={<a href="#home" style={{ color: "inherit", textDecoration: "none" }}>Online Store Example3</a>}
      actions={<AccountMenu />}
    />
  ),
};

export const Open: Story = {
  render: () => (
    <Navbar
      brand={<a href="#home" style={{ color: "inherit", textDecoration: "none" }}>Online Store Example3</a>}
      actions={<AccountMenu defaultOpen />}
    />
  ),
};
