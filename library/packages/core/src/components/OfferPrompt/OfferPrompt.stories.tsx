import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { OfferPrompt } from "./OfferPrompt";

const meta: Meta<typeof OfferPrompt> = {
  title: "Commerce/OfferPrompt",
  component: OfferPrompt,
};
export default meta;
type Story = StoryObj<typeof OfferPrompt>;

export const FriendsAndFamily: Story = {
  args: {
    chip: "Get 10% off",
    title: "Friends & Family",
    description: "25% off sitewide. Exclusions apply.",
    body: "Extra 10% off for rewards members. Sale styles already reduced are excluded. Made-on-demand sizes ship in about 15 business days.",
    closeLabel: "Close",
    dismissLabel: "Dismiss offer",
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return <OfferPrompt {...args} open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />;
  },
};
