import * as React from "react";

/** Text for assistive tech only. Uses the global `.visually-hidden` class from base.scss. */
export function VisuallyHidden({ children, as: Tag = "span" }: { children: React.ReactNode; as?: "span" | "div" }) {
  return <Tag className="visually-hidden">{children}</Tag>;
}
