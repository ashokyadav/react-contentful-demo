import { useEffect, useRef, useState } from "react";
import type { CheckoutAddress } from "../lib/checkoutDraft";

export type PayPalApproval = {
  orderId: string;
  email: string;
  address?: CheckoutAddress;
};

type PayPalAddress = {
  address_line_1?: string;
  address_line_2?: string;
  admin_area_1?: string;
  admin_area_2?: string;
  postal_code?: string;
  country_code?: string;
};

type PayPalCapture = {
  id?: string;
  payer?: { email_address?: string; name?: { given_name?: string; surname?: string } };
  purchase_units?: { shipping?: { name?: { full_name?: string }; address?: PayPalAddress } }[];
};

type PayPalButtons = {
  close: () => Promise<void>;
  render: (target: HTMLElement) => Promise<void>;
};

type PayPalSdk = {
  Buttons: (options: {
    style?: { layout?: "vertical" | "horizontal"; color?: "gold"; shape?: "rect"; label?: "paypal"; height?: number };
    createOrder: (data: unknown, actions: { order: { create: (order: unknown) => Promise<string> } }) => Promise<string>;
    onApprove: (data: unknown, actions: { order: { capture: () => Promise<PayPalCapture> } }) => Promise<void>;
    onError?: () => void;
  }) => PayPalButtons;
};

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb";

function sdkSource() {
  const params = new URLSearchParams({
    "client-id": clientId,
    currency: "USD",
    intent: "capture",
    "disable-funding": "card,credit,venmo,paylater",
  });
  if (clientId === "sb") params.set("buyer-country", "US");
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

let loading: Promise<void> | null = null;

function loadSdk() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.paypal) return Promise.resolve();
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = sdkSource();
      script.async = true;
      script.dataset.paypalSdk = "true";
      script.onload = () => resolve();
      script.onerror = () => {
        loading = null;
        reject(new Error("PayPal did not load"));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}

function addressFrom(details: PayPalCapture): CheckoutAddress | undefined {
  const shipping = details.purchase_units?.[0]?.shipping;
  const addr = shipping?.address;
  if (!addr?.address_line_1 || !addr.admin_area_2 || !addr.postal_code || !addr.country_code) return undefined;
  const full = (shipping?.name?.full_name || "").trim().split(/\s+/);
  return {
    first: details.payer?.name?.given_name || full[0] || "",
    last: details.payer?.name?.surname || full.slice(1).join(" ") || "",
    line1: addr.address_line_1,
    line2: addr.address_line_2 || "",
    city: addr.admin_area_2,
    region: addr.admin_area_1 || "",
    zip: addr.postal_code,
    country: addr.country_code,
  };
}

export function PayPalButton({
  amount,
  layout = "vertical",
  onApproved,
  onError,
}: {
  amount: string;
  layout?: "vertical" | "horizontal";
  onApproved: (approval: PayPalApproval) => void;
  onError?: () => void;
}) {
  const slot = useRef<HTMLDivElement>(null);
  const approved = useRef(onApproved);
  const failed = useRef(onError);
  const [ready, setReady] = useState(false);
  approved.current = onApproved;
  failed.current = onError;

  useEffect(() => {
    let active = true;
    let buttons: PayPalButtons | undefined;
    loadSdk()
      .then(() => {
        if (!active || !slot.current || !window.paypal) return;
        buttons = window.paypal.Buttons({
          style: { layout, color: "gold", shape: "rect", label: "paypal", height: 40 },
          createOrder: (_data, actions) => actions.order.create({
            intent: "CAPTURE",
            purchase_units: [{ amount: { currency_code: "USD", value: amount } }],
            application_context: { shipping_preference: "GET_FROM_FILE" },
          }),
          onApprove: async (_data, actions) => {
            const details = await actions.order.capture();
            const orderId = details.id || "";
            const email = details.payer?.email_address || "";
            if (!orderId) {
              failed.current?.();
              return;
            }
            approved.current({ orderId, email, address: addressFrom(details) });
          },
          onError: () => failed.current?.(),
        });
        return buttons.render(slot.current);
      })
      .then(() => {
        if (active) setReady(true);
      })
      .catch(() => {
        if (active) failed.current?.();
      });
    return () => {
      active = false;
      buttons?.close().catch(() => undefined);
    };
  }, [amount, layout]);

  return <div ref={slot} data-paypal-demo={ready ? "ready" : "loading"} />;
}
