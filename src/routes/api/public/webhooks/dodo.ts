import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

function verify(secret: string, id: string, ts: string, sig: string, body: string) {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
  return sig
    .split(" ")
    .map((part) => (part.includes(",") ? part.split(",")[1] : part))
    .some((candidate) => {
      if (!candidate) return false;
      const a = Buffer.from(candidate);
      const b = Buffer.from(expected);
      return a.length === b.length && timingSafeEqual(a, b);
    });
}

export const Route = createFileRoute("/api/public/webhooks/dodo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["DODO_WEBHOOK_SECRET"];
        if (!secret) return new Response("not configured", { status: 500 });

        const body = await request.text();
        const id = request.headers.get("webhook-id") ?? "";
        const ts = request.headers.get("webhook-timestamp") ?? "";
        const sig = request.headers.get("webhook-signature") ?? "";
        if (!id || !ts || !sig || !verify(secret, id, ts, sig, body)) {
          return new Response("invalid signature", { status: 401 });
        }

        const event = JSON.parse(body) as {
          type?: string;
          data?: { payment_id?: string; metadata?: Record<string, string> };
        };
        const orderId = event.data?.metadata?.["order_id"];
        if (!orderId) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        if (event.type === "payment.succeeded") {
          const { error } = await supabaseAdmin.rpc("complete_payment_order", {
            _order_id: orderId,
            _payment_id: event.data?.payment_id ?? null,
          });
          if (error) {
            console.error("complete_payment_order failed", error.message);
            return new Response("error", { status: 500 });
          }
        } else if (event.type === "payment.failed" || event.type === "payment.cancelled") {
          await supabaseAdmin
            .from("payment_orders")
            .update({ status: "failed" })
            .eq("id", orderId)
            .eq("status", "pending");
        }

        return new Response("ok");
      },
    },
  },
});
