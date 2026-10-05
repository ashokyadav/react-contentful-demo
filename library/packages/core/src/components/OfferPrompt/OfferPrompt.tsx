import { useState } from "react";
import { IconClose } from "@myproject/icons";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
import s from "./OfferPrompt.module.scss";

export interface OfferPromptProps {
  chip: string;
  title: string;
  description: string;
  body: string;
  closeLabel: string;
  dismissLabel: string;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/** A fixed offer chip that opens a details dialog. */
export function OfferPrompt({ chip, title, description, body, closeLabel, dismissLabel, open, onOpen, onClose }: OfferPromptProps) {
  const [dismissed, setDismissed] = useState(false);
  return (
    <>
      {!dismissed && (
        <div className={s.chip}>
          <Button size="sm" onClick={onOpen}>{chip}</Button>
          <button type="button" className={s.dismiss} aria-label={dismissLabel} onClick={() => setDismissed(true)}>
            <IconClose size="sm" />
          </button>
        </div>
      )}
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        description={description}
        footer={<Button onClick={onClose}>{closeLabel}</Button>}
      >
        <p>{body}</p>
      </Modal>
    </>
  );
}
