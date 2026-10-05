import type { Meta, StoryObj } from "@storybook/react";
import { Image } from "./Image";

const photo = "/catalog/Product11.png";

const meta: Meta<typeof Image> = {
  title: "Media/Image",
  component: Image,
  parameters: {
    docs: {
      description: {
        component: `
Pass \`alt\` that describes the image for someone who cannot see it. If the image adds nothing a nearby heading does not already say, set \`decorative\` instead and omit \`alt\`.

\`aspectRatio\` (for example \`"4/5"\`) reserves space so the page does not jump when the file loads. \`priority\` is for the first image on the page: it loads immediately and preloads. Everything else lazy-loads. \`caption\` renders a \`<figcaption>\`.

\`\`\`tsx
<Image src={src} alt="Navy non-iron dress shirt on a hanger" aspectRatio="4/5" />
<Image src={hero} decorative priority aspectRatio="16/9" />
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: { src: photo, alt: "Sand leather satchel with gold hardware", aspectRatio: "4/5", style: { maxWidth: 360 } },
};
export const Decorative: Story = { args: { src: photo, decorative: true, aspectRatio: "16/9", style: { maxWidth: 480 } } };
export const WithCaption: Story = {
  args: { src: photo, alt: "Sand leather satchel with gold hardware", caption: "Sand leather, gold hardware", aspectRatio: "4/5", style: { maxWidth: 360 } },
};
export const Priority: Story = { args: { ...Default.args, priority: true } as never };
