import * as React from "react";
import { IconClose } from "@myproject/icons";
import { useLabel } from "../Labels/Labels";
import { cx } from "../../utils/cx";
import s from "./Tag.module.scss";

export interface TagProps {
  children: string;
  /** Adds a remove button named "Remove {children}", e.g. for active filters. */
  onRemove?: () => void;
  className?: string;
}

export function Tag({ children, onRemove, className }: TagProps) {
  const remove = useLabel("remove", "Remove {name}", { name: children });
  return (
    <span className={cx(s.tag, onRemove && s.removable, className)}>
      {children}
      {onRemove && (
        <button type="button" className={s.remove} onClick={onRemove}>
          <IconClose size="xs" />
          <span className="visually-hidden">{remove}</span>
        </button>
      )}
    </span>
  );
}
