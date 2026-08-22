import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { RANK_PRICES, type PaidRank } from "@/lib/payments";

type CheckoutInput = {
  rank: PaidRank;
  username?: string;
  message?: string;
  returnUrl: string;
};

export const createDodoCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: CheckoutInput) => {
    if (input.rank !== "obsidian" && input.rank !== "seraph") throw new Error("Rango inválido");
    if (!input.returnUrl || !/^https?:\/\//.test(input.returnUrl)) throw new Error("URL inválida");
    return {
      rank: input.rank,
      username: (input.username ?? "").trim().toLowerCase(),
      message: (input.message ?? "").slice(0, 200),
      returnUrl: input.returnUrl,
    };
  })
  .handler(async ({ data, context }) => {
    const apiKey = process.env["DODO_API_KEY"];
    const env = process.env["DODO_ENVIRONMENT"] ?? "test_mode";
    const productId =
      data.rank === "obsidian"
        ? process.env["DODO_PRODUCT_OBSIDIAN"]
        : process.env["DODO_PRODUCT_SERAPH"];
    if (!apiKey || !productId) throw new Error("Dodo Payments no está configurado");

    const base = env === "live_mode" ? "https://live.dodopayments.com" : "https://test.dodopayments.com";
    const { supabase, userId, claims } = context;

    // resolve recipient
    let recipientUserId = userId;
    let recipientUsername = "";
    const isGift = data.username.length > 0;

    if (isGift) {
      const { data: target, error } = await supabase
        .from("profiles")
        .select("user_id, username, rank")
        .ilike("username", data.username)
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!target?.user_id) throw new Error("Usuario no encontrado");
      if (target.rank === data.rank || (target.rank === "seraph" && data.rank === "obsidian")) {
        throw new Error("El usuario ya tiene ese rango o uno superior");
      }
      recipientUserId = target.user_id;
      recipientUsername = target.username;
    } else {
      const { data: mine } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      recipientUsername = mine?.username ?? "";
    }

    const { data: order, error: orderError } = await supabase
      .from("payment_orders")
      .insert({
        buyer_id: userId,
        kind: isGift ? "gift" : "self",
        rank: data.rank,
        recipient_user_id: recipientUserId,
        recipient_username: recipientUsername,
        amount_cents: RANK_PRICES[data.rank],
        currency: "USD",
        status: "pending",
        message: data.message,
      })
      .select("id")
      .single();
    if (orderError || !order) throw new Error(orderError?.message ?? "No se pudo crear el pedido");

    const email = (claims as { email?: string } | null)?.email ?? undefined;

    const res = await fetch(`${base}/checkouts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_cart: [{ product_id: productId, quantity: 1 }],
        customer: email ? { email, name: recipientUsername || "QSY" } : undefined,
        return_url: data.returnUrl,
        metadata: { order_id: order.id, rank: data.rank },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("dodo checkout failed", res.status, detail);
      throw new Error("No se pudo iniciar el pago con Dodo Payments");
    }

    const payload = (await res.json()) as {
      checkout_url?: string;
      payment_link?: string;
      session_id?: string;
      payment_id?: string;
    };
    const url = payload.checkout_url ?? payload.payment_link;
    if (!url) throw new Error("Dodo Payments no devolvió un enlace de pago");

    await supabase
      .from("payment_orders")
      .update({ checkout_url: url })
      .eq("id", order.id);

    return { url, orderId: order.id };
  });

export const listMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("payment_orders")
      .select("id, rank, kind, recipient_username, amount_cents, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
