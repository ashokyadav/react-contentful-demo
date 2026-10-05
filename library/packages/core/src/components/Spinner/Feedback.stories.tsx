import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./Spinner";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { Skeleton } from "../Skeleton/Skeleton";
import { Flex } from "../Layout/Layout";

const meta: Meta = {
  title: "Feedback/Loading",
  parameters: {
    docs: {
      description: {
        component: `
Three ways to show that something is loading. Pick one that matches what the user is waiting for.

**Spinner** — a short, indeterminate wait. \`label\` is read to screen readers and is not shown visually. Place it next to the thing that is loading, or inside a button via \`Button loading\`.

**ProgressBar** — a known or ongoing amount. \`label\` is required. Pass \`value\` and \`max\` when you know the amount, or omit \`value\` for an indeterminate bar. \`valueText\` is what gets announced ("$45 of $75 for free shipping").

**Skeleton** — a placeholder for content that has not arrived. It is hidden from assistive tech. Put \`aria-busy="true"\` on the container and include a \`Spinner\` or status text so the wait is announced.

\`\`\`tsx
<Spinner label="Loading orders" />
<ProgressBar label="Free shipping" value={45} max={75} valueText="$45 of $75" />
<div aria-busy="true"><Skeleton variant="rect" /><Spinner label="Loading product" /></div>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const LoadingSpinner: Story = {
  render: () => <Flex gap="lg" align="center"><Spinner size="sm" /><Spinner /><Spinner size="lg" label="Loading your orders" /></Flex>,
};
export const Progress: Story = {
  render: () => (
    <Flex direction="column" gap="lg" style={{ maxWidth: 400 }}>
      <ProgressBar label="Free shipping" value={45} max={75} valueText="$45 of $75" />
      <ProgressBar label="Upload complete" value={100} tone="success" />
      <ProgressBar label="Loading results" />
    </Flex>
  ),
};
export const SkeletonCard: Story = {
  render: () => (
    <div aria-busy="true" style={{ maxWidth: 280 }}>
      <span className="visually-hidden" role="status">Loading product</span>
      <Skeleton variant="rect" height={340} />
      <div style={{ marginTop: 12 }}><Skeleton lines={3} /></div>
    </div>
  ),
};
