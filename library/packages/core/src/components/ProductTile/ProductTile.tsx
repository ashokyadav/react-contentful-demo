import { useState } from "react";
import { Card } from "../Card/Card";
import { Image } from "../Image/Image";
import { Price } from "../Price/Price";
import { SwatchPicker } from "../SwatchPicker/SwatchPicker";
import s from "./ProductTile.module.scss";

export interface ProductTileProduct {
  title: string;
  href: string;
  price: number;
  compareAt?: number;
  image: string;
  alt: string;
  fit?: "cover" | "contain";
  swatches?: { label: string; value: string; image?: string; alt?: string }[];
}

function withColor(href: string, color: string) {
  if (!color || href.startsWith("#")) return href;
  const [path, hash = ""] = href.split("#");
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}color=${encodeURIComponent(color)}${hash ? `#${hash}` : ""}`;
}

export function ProductTile({ product }: { product: ProductTileProduct }) {
  const swatches = product.swatches ?? [];
  const [color, setColor] = useState(swatches[0]?.value || "");
  const selected = swatches.some((swatch) => swatch.value === color) ? color : swatches[0]?.value || "";
  const chosen = swatches.find((swatch) => swatch.value === selected);
  return (
    <Card
      className={s.card}
      href={withColor(product.href, selected)}
      title={product.title}
      media={<Image src={chosen?.image || product.image} alt={chosen?.alt || product.alt} aspectRatio="3/4" fit={product.fit ?? "cover"} />}
    >
      <Price value={product.price} compareAt={product.compareAt} />
      {swatches.length > 0 && (
        <SwatchPicker label={`${product.title} color`} options={swatches} value={selected} onChange={setColor} />
      )}
    </Card>
  );
}
