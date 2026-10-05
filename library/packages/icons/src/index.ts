import * as React from "react";
import { createIcon } from "./createIcon";

export { createIcon } from "./createIcon";
export type { IconProps, IconSize } from "./createIcon";

const h = React.createElement;

export const IconHome = createIcon("IconHome", [
  h("path", { key: 1, d: "M3 10.5 12 3l9 7.5" }),
  h("path", { key: 2, d: "M5 9.5V21h5v-6h4v6h5V9.5" }),
]);
export const IconSearch = createIcon("IconSearch", [
  h("circle", { key: 1, cx: 10.5, cy: 10.5, r: 6.5 }),
  h("path", { key: 2, d: "m20 20-4.8-4.8" }),
]);
export const IconClose = createIcon("IconClose", h("path", { d: "M6 6l12 12M18 6 6 18" }));
export const IconMenu = createIcon("IconMenu", h("path", { d: "M4 7h16M4 12h16M4 17h16" }));
export const IconChevronLeft = createIcon("IconChevronLeft", h("path", { d: "m15 5-7 7 7 7" }));
export const IconChevronRight = createIcon("IconChevronRight", h("path", { d: "m9 5 7 7-7 7" }));
export const IconChevronDown = createIcon("IconChevronDown", h("path", { d: "m5 9 7 7 7-7" }));
export const IconChevronUp = createIcon("IconChevronUp", h("path", { d: "m5 15 7-7 7 7" }));
export const IconCheck = createIcon("IconCheck", h("path", { d: "m5 12.5 4.5 4.5L19 7.5" }));
export const IconInfo = createIcon("IconInfo", [
  h("circle", { key: 1, cx: 12, cy: 12, r: 9 }),
  h("path", { key: 2, d: "M12 11v6M12 7.5v.01" }),
]);
export const IconSuccess = createIcon("IconSuccess", [
  h("circle", { key: 1, cx: 12, cy: 12, r: 9 }),
  h("path", { key: 2, d: "m8 12.5 3 3 5-6" }),
]);
export const IconWarning = createIcon("IconWarning", [
  h("path", { key: 1, d: "M12 3.5 2.5 20h19L12 3.5Z" }),
  h("path", { key: 2, d: "M12 10v4.5M12 17.5v.01" }),
]);
export const IconError = createIcon("IconError", [
  h("circle", { key: 1, cx: 12, cy: 12, r: 9 }),
  h("path", { key: 2, d: "M12 7.5V13M12 16.5v.01" }),
]);
export const IconPlay = createIcon("IconPlay", h("path", { d: "M7 4.5v15l12-7.5-12-7.5Z", fill: "currentColor" }));
export const IconPause = createIcon("IconPause", h("path", { d: "M8 5v14M16 5v14", strokeWidth: 3 }));
export const IconUser = createIcon("IconUser", [
  h("circle", { key: 1, cx: 12, cy: 8, r: 4 }),
  h("path", { key: 2, d: "M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" }),
]);
export const IconBag = createIcon("IconBag", [
  h("path", { key: 1, d: "M5 8h14l-1 13H6L5 8Z" }),
  h("path", { key: 2, d: "M9 8V6a3 3 0 0 1 6 0v2" }),
]);
export const IconHeart = createIcon("IconHeart", h("path", {
  d: "M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 7.3 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z",
}));
export const IconPin = createIcon("IconPin", [
  h("path", { key: 1, d: "M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" }),
  h("circle", { key: 2, cx: 12, cy: 10, r: 2.5 }),
]);
export const IconSort = createIcon("IconSort", h("path", { d: "m8 9 4-4 4 4M8 15l4 4 4-4" }));
