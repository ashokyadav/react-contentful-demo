import * as React from "react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, "ref"> {
  size?: IconSize | number;
  /**
   * Accessible name. Provide it when the icon carries meaning on its own
   * (e.g. a status icon with no text). Omit it for decorative icons —
   * they are hidden from assistive tech.
   */
  title?: string;
}

const sizes: Record<IconSize, number> = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 };

export function createIcon(displayName: string, path: React.ReactNode) {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = "md", title, ...rest }, ref) => {
      const px = typeof size === "number" ? size : sizes[size];
      const titleId = React.useId();
      const a11y = title
        ? { role: "img", "aria-labelledby": titleId }
        : { "aria-hidden": true as const, focusable: "false" as const };
      return (
        <svg
          ref={ref}
          width={px}
          height={px}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          {...a11y}
          {...rest}
        >
          {title ? <title id={titleId}>{title}</title> : null}
          {path}
        </svg>
      );
    }
  );
  Icon.displayName = displayName;
  return Icon;
}
