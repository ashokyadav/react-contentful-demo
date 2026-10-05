import type { CheckoutAddress, PlacedLine, PlacedOrder } from "./checkoutDraft";

type StoredLine = {
  line_id?: string;
  line_title?: string;
  line_href?: string;
  line_image?: string;
  line_alt?: string;
  line_price?: number;
  line_compare?: number;
  line_color?: string;
  line_qty?: number;
};

type StoredOrder = {
  order_number?: string;
  order_email?: string;
  order_site?: string;
  order_method?: string;
  order_pay?: string;
  order_card_name?: string;
  order_card_last4?: string;
  order_gift?: string;
  order_paypal?: string;
  ship_first?: string;
  ship_last?: string;
  ship_line1?: string;
  ship_line2?: string;
  ship_city?: string;
  ship_region?: string;
  ship_zip?: string;
  ship_country?: string;
  bill_first?: string;
  bill_last?: string;
  bill_line1?: string;
  bill_line2?: string;
  bill_city?: string;
  bill_region?: string;
  bill_zip?: string;
  bill_country?: string;
  order_lines?: StoredLine[];
};

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function amount(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number.NaN;
}

function addressOf(prefix: "ship" | "bill", record: StoredOrder): CheckoutAddress | undefined {
  const read = (name: string) => text(record[`${prefix}_${name}` as keyof StoredOrder]);
  const address = {
    first: read("first"),
    last: read("last"),
    line1: read("line1"),
    line2: read("line2"),
    city: read("city"),
    region: read("region"),
    zip: read("zip"),
    country: read("country"),
  };
  if (!address.first || !address.line1 || !address.city) return undefined;
  return address;
}

function addressFields(prefix: "ship" | "bill", address: CheckoutAddress) {
  const fields: Record<string, string> = {
    [`${prefix}_first`]: address.first.trim(),
    [`${prefix}_last`]: address.last.trim(),
    [`${prefix}_line1`]: address.line1.trim(),
    [`${prefix}_city`]: address.city.trim(),
    [`${prefix}_region`]: address.region.trim(),
    [`${prefix}_zip`]: address.zip.trim(),
    [`${prefix}_country`]: address.country.trim(),
  };
  const line2 = address.line2.trim();
  if (line2) fields[`${prefix}_line2`] = line2;
  return fields;
}

function lineOf(record: StoredLine): PlacedLine | null {
  const price = amount(record.line_price);
  const quantity = amount(record.line_qty);
  if (!record.line_id || !record.line_title || !Number.isFinite(price) || !Number.isFinite(quantity)) return null;
  const compare = amount(record.line_compare);
  return {
    id: record.line_id,
    title: record.line_title,
    href: text(record.line_href),
    image: text(record.line_image),
    alt: text(record.line_alt) || record.line_title,
    price,
    ...(Number.isFinite(compare) ? { compareAt: compare } : {}),
    ...(text(record.line_color) ? { color: text(record.line_color) } : {}),
    quantity,
  };
}

function orderOf(record: StoredOrder): PlacedOrder | null {
  const address = addressOf("ship", record);
  const lines = (record.order_lines ?? []).flatMap((line) => {
    const placed = lineOf(line);
    return placed ? [placed] : [];
  });
  if (!record.order_number || !record.order_email || !record.order_method || !record.order_pay || !address || !lines.length) return null;
  const billing = addressOf("bill", record);
  return {
    number: record.order_number,
    lines,
    address,
    method: record.order_method,
    email: record.order_email,
    pay: record.order_pay,
    ...(text(record.order_card_name) ? { cardName: text(record.order_card_name) } : {}),
    ...(text(record.order_card_last4) ? { cardLast4: text(record.order_card_last4) } : {}),
    ...(billing ? { billing } : {}),
    ...(text(record.order_gift) ? { giftMessage: text(record.order_gift) } : {}),
    ...(text(record.order_paypal) ? { paypalOrderId: text(record.order_paypal) } : {}),
  };
}

function storedOrder(order: PlacedOrder, siteKey: string): StoredOrder | null {
  const email = order.email.trim().toLowerCase();
  const lines = order.lines.flatMap((line) => {
    if (!line.id || !line.title || !Number.isFinite(line.price) || !Number.isFinite(line.quantity)) return [];
    const stored: StoredLine = {
      line_id: line.id,
      line_title: line.title,
      line_price: line.price,
      line_qty: line.quantity,
    };
    if (line.href) stored.line_href = line.href;
    if (line.image) stored.line_image = line.image;
    if (line.alt) stored.line_alt = line.alt;
    if (typeof line.compareAt === "number") stored.line_compare = line.compareAt;
    if (line.color) stored.line_color = line.color;
    return [stored];
  });
  if (!order.number.trim() || !email.includes("@") || !order.method || !order.pay || !order.address || !lines.length) return null;
  return {
    order_number: order.number.trim(),
    order_email: email,
    order_site: siteKey,
    order_method: order.method,
    order_pay: order.pay,
    ...(order.cardName ? { order_card_name: order.cardName } : {}),
    ...(order.cardLast4 ? { order_card_last4: order.cardLast4 } : {}),
    ...(order.giftMessage ? { order_gift: order.giftMessage } : {}),
    ...(order.paypalOrderId ? { order_paypal: order.paypalOrderId } : {}),
    ...addressFields("ship", order.address),
    ...(order.billing ? addressFields("bill", order.billing) : {}),
    order_lines: lines,
  };
}

export async function saveOrder(site: { key: string }, order: PlacedOrder): Promise<PlacedOrder | null> {
  if (!site.key) return null;
  const stored = storedOrder(order, site.key);
  return stored ? orderOf(stored) : null;
}

export async function ordersForShopper(): Promise<PlacedOrder[]> {
  return [];
}
