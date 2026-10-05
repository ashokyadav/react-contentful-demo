import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Form, FormGroup, ErrorSummary } from "./Form";
import { TextInput } from "../TextInput/TextInput";
import { Select } from "../Select/Select";
import { Checkbox } from "../Checkbox/Checkbox";
import { Button } from "../Button/Button";

const meta: Meta<typeof Form> = {
  title: "Form/Form",
  component: Form,
  parameters: {
    docs: {
      description: {
        component: `
\`Form\` is a \`<form>\` that turns off the browser's native bubbles (\`customValidation\`, on by default) so library field errors are the only messages.

Group related fields with \`FormGroup\` and a \`legend\` ("Shipping address"). After a failed submit, render \`ErrorSummary\` first and move focus to it. Each item's \`fieldId\` must match the field's \`id\`; choosing an item focuses that field.

\`\`\`tsx
<ErrorSummary ref={summaryRef} errors={[{ fieldId: "email", message: "Enter an email address" }]} />
<Form onSubmit={onSubmit}>
  <FormGroup legend="Contact" columns={2}>
    <TextInput id="email" label="Email" type="email" required />
  </FormGroup>
  <Button type="submit">Place order</Button>
</Form>
\`\`\`
        `,
      },
    },
  },
};
export default meta;

type Errors = Partial<Record<"email" | "first" | "last" | "zip" | "state", string>>;

function CheckoutForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!/^\S+@\S+\.\S+$/.test(String(d.get("email")))) next.email = "Enter an email address in the format name@example.com";
    if (!d.get("first")) next.first = "Enter your first name";
    if (!d.get("last")) next.last = "Enter your last name";
    if (!/^\d{5}$/.test(String(d.get("zip")))) next.zip = "Enter a 5-digit ZIP code";
    if (!d.get("state")) next.state = "Select a state";
    setErrors(next);
    setDone(Object.keys(next).length === 0);
    if (Object.keys(next).length) requestAnimationFrame(() => summaryRef.current?.focus());
  };

  const list = (Object.entries(errors) as Array<[keyof Errors, string]>).map(([k, m]) => ({ fieldId: `co-${k}`, message: m }));

  return (
    <Form onSubmit={onSubmit}>
      <ErrorSummary ref={summaryRef} errors={list} />
      {done && <p role="status">Details saved. Continue to payment.</p>}
      <FormGroup legend="Contact">
        <TextInput id="co-email" name="email" label="Email address" type="email" autoComplete="email" required error={errors.email} />
      </FormGroup>
      <FormGroup legend="Shipping address" columns={2}>
        <TextInput id="co-first" name="first" label="First name" autoComplete="given-name" required error={errors.first} />
        <TextInput id="co-last" name="last" label="Last name" autoComplete="family-name" required error={errors.last} />
        <Select id="co-state" name="state" label="State" placeholder="Select a state" required error={errors.state}
          options={[{ value: "TX", label: "Texas" }, { value: "CA", label: "California" }, { value: "NY", label: "New York" }]} />
        <TextInput id="co-zip" name="zip" label="ZIP code" inputMode="numeric" autoComplete="postal-code" required error={errors.zip} />
      </FormGroup>
      <Checkbox name="save" label="Save this address for next time" />
      <div style={{ marginTop: 24 }}><Button type="submit">Continue to payment</Button></div>
    </Form>
  );
}

export const CheckoutWithValidation: StoryObj = { render: () => <CheckoutForm /> };
