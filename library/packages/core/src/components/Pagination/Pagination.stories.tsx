import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Navigation/Pagination",
  component: Pagination,
  parameters: {
    docs: {
      description: {
        component: `
Page controls for a list that does not fit on one screen. It is controlled: keep \`page\` in state and update it from \`onPageChange\`. Pages are 1-based.

Nothing renders when \`totalPages\` is 0 or 1. \`siblings\` is how many page numbers to show on each side of the current page. \`label\` names the navigation landmark when a page has more than one.

\`\`\`tsx
<Pagination page={page} totalPages={12} onPageChange={setPage} />
\`\`\`
        `,
      },
    },
  },
};
export default meta;
export const Default: StoryObj<typeof Pagination> = {
  args: { totalPages: 12 },
  render: (args) => {
    const [page, setPage] = useState(5);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};
