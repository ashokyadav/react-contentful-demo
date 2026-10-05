import type { Meta, StoryObj } from "@storybook/react";
import { VideoPlayer } from "./VideoPlayer";

const src = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
const poster = "/catalog/Product20.png";

// Title kept at "Core/VideoPlayer" so the documented path ?path=/story/core-videoplayer--inline-variant resolves.
const meta: Meta<typeof VideoPlayer> = {
  title: "Core/VideoPlayer",
  component: VideoPlayer,
  parameters: {
    docs: {
      description: {
        component: `
\`variant="inline"\` is a normal player: pass \`title\` (the accessible name), \`src\`, and \`tracks\` when the video has speech. Link a transcript with \`transcriptHref\`.

\`variant="ambient"\` is a muted, looping background. It always shows a pause control and does not autoplay when the user prefers reduced motion. Put overlay copy in \`children\`.

\`\`\`tsx
<VideoPlayer variant="inline" src={src} title="Spring collection preview" tracks={captions} transcriptHref="#transcript" />
<VideoPlayer variant="ambient" src={src} title="Campaign film" aspectRatio="21/9" />
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof VideoPlayer>;

export const InlineVariant: Story = {
  args: { variant: "inline", src, poster, title: "Spring collection preview", transcriptHref: "#transcript" },
  render: (args) => <div style={{ maxWidth: 720 }}><VideoPlayer {...args} /></div>,
};

export const AmbientVariant: Story = {
  args: { variant: "ambient", src, poster, title: "Spring collection", aspectRatio: "21/9" },
  render: (args) => (
    <VideoPlayer {...args}>
      <h2 style={{ margin: 0, fontSize: "var(--font-size-3xl)" }}>Made for movement</h2>
      <p style={{ margin: "8px 0 0" }}>New spring layers, in store and online.</p>
    </VideoPlayer>
  ),
};
