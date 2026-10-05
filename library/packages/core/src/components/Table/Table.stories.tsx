import type { Meta, StoryObj } from "@storybook/react";
import { Table, type TableColumn } from "./Table";
import { Badge } from "../Badge/Badge";

interface Order { id: string; date: string; items: number; total: number; status: "Delivered" | "Shipped" | "Processing"; }
const rows: Order[] = [
  { id: "LL-10482", date: "2026-09-02", items: 3, total: 214, status: "Delivered" },
  { id: "LL-10511", date: "2026-09-14", items: 1, total: 98, status: "Shipped" },
  { id: "LL-10534", date: "2026-09-27", items: 2, total: 176, status: "Processing" },
];
const tone = { Delivered: "success", Shipped: "info", Processing: "neutral" } as const;
const columns: TableColumn<Order>[] = [
  { key: "id", header: "Order", cell: (r) => <a href="#">{r.id}</a>, rowHeader: true },
  { key: "date", header: "Date", cell: (r) => new Date(r.date).toLocaleDateString("en-US", { dateStyle: "medium" }), sortValue: (r) => r.date },
  { key: "items", header: "Items", cell: (r) => r.items, align: "end", sortValue: (r) => r.items },
  { key: "total", header: "Total", cell: (r) => `$${r.total.toFixed(2)}`, align: "end", sortValue: (r) => r.total },
  { key: "status", header: "Status", cell: (r) => <Badge tone={tone[r.status]}>{r.status}</Badge> },
];

const meta: Meta<typeof Table<Order>> = {
  title: "Data Display/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component: `
A data table. \`caption\` is required — it is the accessible name of the table. Set \`hideCaption\` only when a heading already above the table says the same thing.

Each column has \`header\`, \`cell\`, and optionally \`sortValue\` (which makes the header a sort button) and \`align="end"\` for numbers. \`rowHeader\` marks the column that names the row. \`getRowKey\` must return a stable id. \`emptyMessage\` shows when \`rows\` is empty.

\`\`\`tsx
<Table
  caption="Recent orders"
  rows={orders}
  getRowKey={(order) => order.id}
  columns={[
    { key: "id", header: "Order", cell: (order) => order.id, rowHeader: true },
    { key: "total", header: "Total", align: "end", sortValue: (order) => order.total, cell: (order) => order.total },
  ]}
/>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Table<Order>>;

export const SortableOrders: Story = { args: { caption: "Recent orders", columns, rows, getRowKey: (r) => r.id } };
export const Striped: Story = { args: { ...SortableOrders.args, striped: true } };
export const Empty: Story = { args: { ...SortableOrders.args, rows: [], emptyMessage: "You haven't placed any orders yet." } };
