import type { Meta, StoryObj } from "@storybook/react";
import { HeritageNote } from "./HeritageNote";

const meta: Meta<typeof HeritageNote> = {
  title: "Commerce/HeritageNote",
  component: HeritageNote,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof HeritageNote>;

export const ClosingLine: Story = {
  args: {
    mark: "Online Store Example3",
    text: "Clothing built on craft, cloth, and a fit that lasts.",
  },
};
