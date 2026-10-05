import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Autocomplete, type AutocompleteOption } from "./Autocomplete";

const stores: AutocompleteOption[] = [
  { value: "legacy-west", label: "Legacy West", description: "Plano, TX" },
  { value: "northpark", label: "NorthPark Center", description: "Dallas, TX" },
  { value: "southlake", label: "Southlake Town Square", description: "Southlake, TX" },
  { value: "domain", label: "The Domain", description: "Austin, TX" },
  { value: "galleria", label: "The Galleria", description: "Houston, TX" },
  { value: "stonebriar", label: "Stonebriar Centre", description: "Frisco, TX" },
];

const meta: Meta<typeof Autocomplete> = {
  title: "Form/Autocomplete",
  component: Autocomplete,
  parameters: {
    docs: {
      description: {
        component: `
A text field that filters a list and lets the user pick one option. Use \`Select\` when the list is short and known. Use this when the list is long or loaded as the user types.

\`options\` are \`{ value, label, description? }\`. \`onChange\` receives the chosen option, or \`null\` when the field is cleared. \`onInputChange\` fires on every keystroke — use it to fetch options. Pass a \`filter\` to replace the default case-insensitive match.

Arrow keys move through the list, Enter selects, and Escape closes it.

\`\`\`tsx
<Autocomplete
  label="Pick-up store"
  options={stores}
  onInputChange={searchStores}
  onChange={setStore}
/>
\`\`\`
        `,
      },
    },
  },
  args: { label: "Pick-up store", hint: "Start typing a store or mall name", options: stores },
};
export default meta;
type Story = StoryObj<typeof Autocomplete>;

export const Default: Story = {
  render: (args) => {
    const [v, setV] = useState<AutocompleteOption | null>(null);
    return (
      <div style={{ maxWidth: 400 }}>
        <Autocomplete {...args} value={v} onChange={setV} />
        <p>Selected: {v ? v.label : "none"}</p>
      </div>
    );
  },
};
export const WithError: Story = { args: { required: true, error: "Choose a store from the list" } };
