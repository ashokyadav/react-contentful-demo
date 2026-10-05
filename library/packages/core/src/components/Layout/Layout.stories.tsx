import type { Meta, StoryObj } from "@storybook/react";
import { IconBag, IconHeart, IconUser } from "@myproject/icons";
import { Container, Grid, GridItem, Flex, Header, Footer, Sidebar, Navigation } from "./Layout";

const meta: Meta = {
  title: "Layout/Layout",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
Page structure. These pieces do not share one component; import the ones you need from \`@myproject/core\`.

**Container** centers content. \`size\` is \`sm\`, \`md\`, \`lg\`, \`xl\`, or \`full\`.

**Grid** and **GridItem** lay out a catalog. \`columns\` is a number or \`{ base, md, lg }\`. \`minItemWidth\` switches to auto-fill columns. \`GridItem span\` widens one cell.

**Flex** is a one-off row or column. \`direction="row-reverse"\` only changes the visual order — keep the DOM in reading order.

**Header** is the banner landmark and includes a skip link. Point \`mainContentId\` at your \`<main>\`. \`sticky\` pins it.

**Footer** is the contentinfo landmark.

**Sidebar** places a complementary region beside \`main\`. \`label\` is required ("Filters", "Account"). It stacks on small screens.

**Navigation** is a list of links. \`label\` is required when the page has more than one nav. \`orientation="horizontal"\` is for a department bar; the default is a vertical list.

\`\`\`tsx
<Header sticky mainContentId="main-content">
  <Navigation label="Primary" orientation="horizontal" items={[{ label: "Men", href: "/men", current: true }]} />
</Header>
<main id="main-content" tabIndex={-1}>
  <Container>
    <Grid columns={{ base: 2, md: 4 }} gap="lg">{products}</Grid>
  </Container>
</main>
<Footer />
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const Box = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "var(--color-background-secondary)", padding: 16, border: "1px dashed var(--color-stone-300)" }}>{children}</div>
);

export const ContainerSizes: Story = {
  render: () => (
    <Flex direction="column" gap="md">
      {(["sm", "md", "lg", "xl"] as const).map((sz) => <Container key={sz} size={sz}><Box>Container {sz}</Box></Container>)}
    </Flex>
  ),
};

export const ResponsiveGrid: Story = {
  render: () => (
    <Container>
      <Grid as="ul" columns={{ base: 2, md: 3, lg: 4 }} gap="lg">
        {Array.from({ length: 8 }, (_, i) => <GridItem as="li" key={i}><Box>Product {i + 1}</Box></GridItem>)}
      </Grid>
    </Container>
  ),
};

export const AutoFillGrid: Story = {
  render: () => (
    <Container>
      <Grid minItemWidth="14rem" gap="md">
        {Array.from({ length: 6 }, (_, i) => <Box key={i}>Tile {i + 1}</Box>)}
      </Grid>
    </Container>
  ),
};

export const FlexRow: Story = {
  render: () => (
    <Container>
      <Flex justify="space-between" align="center" gap="md" wrap>
        <Box>Start</Box><Box>Middle</Box><Box>End</Box>
      </Flex>
    </Container>
  ),
};

export const PageShell: Story = {
  render: () => (
    <>
      <Header sticky>
        <span className="display" style={{ fontSize: "1.75rem" }}>Online Store Example3</span>
        <Navigation label="Primary" orientation="horizontal"
          items={[
            { label: "Men", href: "#", current: true },
            { label: "Shirts", href: "#" },
            { label: "Suits", href: "#" },
            { label: "Women", href: "#" },
            { label: "Sale", href: "#" },
          ]} />
      </Header>
      <main id="main-content" tabIndex={-1}>
        <Container style={{ paddingBlock: 32 }}>
          <Sidebar label="Account" main={<Box>Order history goes here.</Box>}>
            <Navigation label="Account" items={[
              { label: "Profile", href: "#", icon: <IconUser size="sm" /> },
              { label: "Orders", href: "#", current: true, icon: <IconBag size="sm" /> },
              { label: "Wish list", href: "#", icon: <IconHeart size="sm" /> },
            ]} />
          </Sidebar>
        </Container>
      </main>
      <Footer>
        <Container><p style={{ margin: 0, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: "0.75rem" }}>Customer care · Rewards · Stores & services</p></Container>
      </Footer>
    </>
  ),
};
