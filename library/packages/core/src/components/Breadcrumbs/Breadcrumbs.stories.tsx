import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Navigation/Breadcrumbs",
  component: Breadcrumbs,
  parameters: {
    docs: {
      description: {
        component: `
The path back up the catalog. Pass \`items\` from the root to the current page. Omit \`href\` on the last item — it is the current page and is not a link.

\`label\` defaults to "Breadcrumb". Pass \`linkComponent\` to render Next.js or React Router links.

\`\`\`tsx
<Breadcrumbs
  items={[
    { label: "Home", href: "/" },
    { label: "Men", href: "/men" },
    { label: "Dress shirts", href: "/men/dress-shirts" },
    { label: "Non-iron oxford" },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
export const Default: StoryObj<typeof Breadcrumbs> = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Women", href: "#" }, { label: "Jackets", href: "#" }, { label: "Down for It All Jacket" }] },
};
