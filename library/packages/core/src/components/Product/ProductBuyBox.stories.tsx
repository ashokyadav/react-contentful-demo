import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Accordion } from "../Accordion/Accordion";
import { Alert } from "../Alert/Alert";
import { Badge } from "../Badge/Badge";
import { Breadcrumbs } from "../Breadcrumbs/Breadcrumbs";
import { Button } from "../Button/Button";
import { Gallery } from "../Gallery/Gallery";
import { Grid } from "../Layout/Layout";
import { OptionGroup } from "../OptionGroup/OptionGroup";
import { Price } from "../Price/Price";
import { QuantityInput } from "../QuantityInput/QuantityInput";
import { Radio, RadioGroup } from "../Radio/Radio";

const photo = (file: string) => `/catalog/${file}`;

const colors = [
  { value: "brown", label: "Brown", swatch: "#6b4f3a" },
  { value: "navy", label: "Navy", swatch: "#001f36" },
  { value: "grey", label: "Grey", swatch: "#8a8680" },
];
const chest = ["36", "38", "39", "40", "41", "42", "44", "46"].map((n) => ({ value: n, label: n }));
const length = [
  { value: "short", label: "Short" },
  { value: "regular", label: "Regular" },
  { value: "long", label: "Long" },
];

function BuyBox() {
  const [color, setColor] = useState("brown");
  const [size, setSize] = useState("");
  const [fit, setFit] = useState("");
  const [qty, setQty] = useState(3);
  const ready = Boolean(size && fit);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Breadcrumbs items={[{ label: "Clothing", href: "#clothing" }, { label: "Jackets", href: "#jackets" }, { label: "Bomber jacket" }]} />
      <Grid columns={{ base: 1, lg: 2 }} gap="xl">
        <Gallery
          label="Bomber jacket"
          images={[
            { src: photo("Product16.png"), alt: "Olive bomber jacket" },
            { src: photo("Product13.png"), alt: "Navy polo shirt" },
            { src: photo("Product18.png"), alt: "Blush wrap dress" },
          ]}
        />
        <div>
          <Badge tone="sale">New / Now 25% off</Badge>
          <h1 className="display" style={{ fontSize: "var(--font-size-2xl)", margin: "12px 0" }}>
            Bomber jacket
          </h1>
          <Price value={598.5} compareAt={798} />
          <div style={{ height: 24 }} />
          <OptionGroup legend="Color" options={colors} value={color} onChange={setColor} />
          <OptionGroup legend="Chest" placeholder="Select chest" options={chest} value={size} onChange={setSize} required />
          <OptionGroup legend="Length" placeholder="Select length" options={length} value={fit} onChange={setFit} required />
          {ready && (
            <Alert tone="info" title="This size is made on demand">
              <p>Your order ships within 15 business days. A $20 shipping fee applies. This size cannot be cancelled, returned, or picked up in store.</p>
            </Alert>
          )}
          <RadioGroup legend="Delivery" defaultValue="ship">
            <Radio value="ship" label="Ship to me" />
            <Radio value="pickup" label="Free pickup" hint="Store pickup is unavailable for made-on-demand sizes." disabled />
          </RadioGroup>
          <QuantityInput value={qty} onChange={setQty} min={1} max={10} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16, maxWidth: 420 }}>
            <Button fullWidth disabled={!ready}>{ready ? "Add to bag" : "Select a size"}</Button>
            <Button variant="tertiary">Add to wishlist</Button>
            {ready && <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Only 10 available</p>}
          </div>
          <div style={{ marginTop: 32 }}>
            <Accordion
              defaultValue={["details"]}
              items={[
                {
                  id: "details",
                  title: "Product details & care",
                  content: <p>Zip-front bomber with ribbed collar, cuffs, and hem, plus two zip pockets. Dry clean.</p>,
                },
                {
                  id: "shipping",
                  title: "Shipping & returns",
                  content: <p>Standard shipping arrives in 3 to 7 business days. Most items can be returned within 60 days. Made-on-demand sizes are final sale.</p>,
                },
              ]}
            />
          </div>
        </div>
      </Grid>
    </div>
  );
}

const meta: Meta = {
  title: "Product/Buy box",
  parameters: {
    docs: {
      description: {
        component: `
The jacket product page is not one component. Breadcrumbs, Gallery, Badge, Alert, Button, and Radio already covered the chrome, the photos, the sale label, the made-on-demand note, and delivery.

This story adds the four pieces that page still needed, using the bomber jacket as the example:

- **Price** — \`$598.50\` with \`$798\` struck through
- **OptionGroup** — color swatches, chest, and length
- **QuantityInput** — the quantity in the page address starts at 3
- **Accordion** — product details and shipping

Add to bag stays disabled until chest and length are both chosen, and then reads "Add to bag".
        `,
      },
    },
  },
};
export default meta;

export const Jacket: StoryObj = { render: () => <BuyBox /> };
