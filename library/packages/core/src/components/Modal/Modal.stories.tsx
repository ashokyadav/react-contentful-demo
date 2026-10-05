import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal, type ModalProps } from "./Modal";
import { Button } from "../Button/Button";
import { TextInput } from "../TextInput/TextInput";

const meta: Meta<typeof Modal> = {
  title: "Feedback/Modal",
  component: Modal,
  parameters: {
    docs: {
      description: {
        component: `
A dialog built on the native \`<dialog>\` element. The page behind is inert, focus stays inside, Escape closes, and focus returns to the button that opened it.

Keep \`open\` in state and pass \`onClose\`. \`title\` is required. Use \`placement="drawer"\` for a bag or filters panel. Set \`closeOnBackdrop={false}\` when the dialog holds a form the user could lose. Put actions in \`footer\`.

\`\`\`tsx
<Button onClick={() => setOpen(true)}>Remove item</Button>
<Modal open={open} onClose={() => setOpen(false)} title="Remove this shirt?" footer={<Button variant="danger" onClick={remove}>Remove</Button>}>
  <p>You can add it again from the product page.</p>
</Modal>
\`\`\`
        `,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Modal>;

function Demo(props: Partial<ModalProps> & { trigger: string }) {
  const [open, setOpen] = useState(false);
  const { trigger, ...rest } = props;
  return (
    <>
      <Button onClick={() => setOpen(true)}>{trigger}</Button>
      <Modal
        title="Remove this item?"
        {...rest}
        open={open}
        onClose={() => setOpen(false)}
        footer={rest.footer ?? (<>
          <Button variant="secondary" onClick={() => setOpen(false)}>Keep item</Button>
          <Button variant="danger" onClick={() => setOpen(false)}>Remove item</Button>
        </>)}
      />
    </>
  );
}

export const Confirmation: Story = {
  render: () => <Demo trigger="Remove item" size="sm" description="Align High-Rise Pant, size 6, will be removed from your bag." />,
};
export const WithForm: Story = {
  render: () => (
    <Demo trigger="Edit address" title="Edit shipping address" closeOnBackdrop={false}>
      <TextInput label="Street address" autoComplete="street-address" />
      <TextInput label="City" autoComplete="address-level2" />
    </Demo>
  ),
};
export const Drawer: Story = {
  render: () => (
    <Demo trigger="Open bag" title="Your bag (2)" placement="drawer" footer={<Button fullWidth>Check out</Button>}>
      <p>Align High-Rise Pant — $98</p><p>Swiftly Tech Tee — $78</p>
    </Demo>
  ),
};
