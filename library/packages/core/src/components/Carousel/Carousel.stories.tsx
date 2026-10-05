import type { Meta, StoryObj } from "@storybook/react";
import { Carousel } from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Media/Carousel",
  component: Carousel,
  parameters: {
    docs: {
      description: {
        component: `
A row of slides with previous, next, and a slide picker. \`label\` names the region ("Seasonal highlights"). Each child is one slide. Five slides show at once on a wide layout.

Leave \`autoPlayInterval\` unset unless the slides must rotate. When it is set, a pause button is shown and rotation stops while the pointer or focus is on the carousel. \`loop={false}\` disables wrapping at the ends. Links in hidden slides are removed from the tab order.

\`\`\`tsx
<Carousel label="Seasonal highlights">
  <article><h2>Fall collection</h2></article>
  <article><h2>Non-iron shirts</h2></article>
</Carousel>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Carousel>;

const slides = [
  { title: "Run season is here", body: "Lightweight layers built for early miles.", bg: "#e7ece4" },
  { title: "Studio to street", body: "Soft fabrics that move with you all day.", bg: "#ecebe6" },
  { title: "Free hemming", body: "Every pant, every size, in every store.", bg: "#e6ebf1" },
  { title: "New colorways", body: "Seasonal shades across the collection.", bg: "#f3ebe4" },
  { title: "Gift wrapping", body: "A finished package, ready to give.", bg: "#ece8f1" },
  { title: "Store pickup", body: "Order online and collect in store.", bg: "#e8f0ea" },
];

const render = (args: Parameters<typeof Carousel>[0]) => (
  <div style={{ maxWidth: 1200 }}>
    <Carousel {...args}>
      {slides.map((sl) => (
        <div key={sl.title} style={{ background: sl.bg, padding: 48, minHeight: 240 }}>
          <h3 style={{ margin: 0, fontSize: 28 }}>{sl.title}</h3>
          <p>{sl.body}</p>
          <a href="#">Shop now<span className="visually-hidden">: {sl.title}</span></a>
        </div>
      ))}
    </Carousel>
  </div>
);

export const Default: Story = { args: { label: "Seasonal highlights" }, render };
export const AutoRotating: Story = { args: { label: "Seasonal highlights", autoPlayInterval: 5000 }, render };
export const NoLoop: Story = { args: { label: "Seasonal highlights", loop: false }, render };
