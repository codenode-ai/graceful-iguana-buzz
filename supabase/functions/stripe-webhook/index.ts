import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import type StripeType from "npm:stripe@12.17.0";
import { stripe } from "../_shared/stripe.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { corsHeaders, jsonResponse } from "../_shared/responses.ts";

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

const statusMap = new Set([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "unpaid",
  "paused",
]);

const toIso = (value?: number | null) =>
  typeof value === "number" ? new Date(value * 1000).toISOString() : null;

async function findCompanyId(subscription: StripeType.Subscription): Promise<string | null> {
  const fromMetadata = subscription.metadata?.company_id;
  if (fromMetadata) return fromMetadata;

  const customerId = typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer?.id;

  if (!customerId) return null;

  const { data, error } = await supabaseAdmin
    .from("stripe_customers")
    .select("company_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.company_id ?? null;
}

async function upsertSubscription(event: StripeType.Event, subscription: StripeType.Subscription) {
  const companyId = await findCompanyId(subscription);
  if (!companyId) throw new Error("company_id não encontrado para assinatura");

  const priceId = subscription.items?.data?.[0]?.price?.id ?? null;
  let planId: string | null = null;

  if (priceId) {
    const { data: planRow } = await supabaseAdmin
      .from("plans")
      .select("id")
      .eq("stripe_price_id", priceId)
      .maybeSingle();
    planId = planRow?.id ?? null;
  }

  const normalizedStatus = statusMap.has(subscription.status)
    ? (subscription.status as StripeType.Subscription.Status)
    : "active";

  const upsertPayload = {
    company_id: companyId,
    plan_id: planId,
    stripe_subscription_id: subscription.id,
    status: normalizedStatus,
    current_period_start: toIso(subscription.current_period_start),
    current_period_end: toIso(subscription.current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    canceled_at: toIso(subscription.canceled_at),
    trial_ends_at: toIso(subscription.trial_end),
    metadata: subscription.metadata ?? {},
  };

  const { data: subscriptionRow, error } = await supabaseAdmin
    .from("subscriptions")
    .upsert(upsertPayload, { onConflict: "stripe_subscription_id" })
    .select("id")
    .single();

  if (error) throw error;

  const { error: companyUpdateError } = await supabaseAdmin
    .from("companies")
    .update({
      stripe_customer_id: typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id ?? null,
      subscription_status: normalizedStatus,
      billing_plan_id: planId,
      trial_ends_at: toIso(subscription.trial_end),
    })
    .eq("id", companyId);

  if (companyUpdateError) throw companyUpdateError;

  const { error: eventInsertError } = await supabaseAdmin
    .from("subscription_events")
    .insert({
      subscription_id: subscriptionRow.id,
      stripe_event_id: event.id,
      event_type: event.type ?? "unknown",
      payload: event as Record<string, unknown>,
    });

  if (eventInsertError) throw eventInsertError;
}

async function handleInvoiceEvent(event: StripeType.Event, invoice: StripeType.Invoice) {
  if (!invoice.subscription) return;
  const subscriptionId = typeof invoice.subscription === "string"
    ? invoice.subscription
    : invoice.subscription.id;

  const { data: subscriptionRow } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  const subscriptionPk = subscriptionRow?.id ?? null;

  const { error } = await supabaseAdmin
    .from("subscription_events")
    .insert({
      subscription_id: subscriptionPk,
      stripe_event_id: event.id,
      event_type: event.type ?? "invoice_event",
      payload: event as Record<string, unknown>,
    });

  if (error) throw error;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!webhookSecret) {
    return jsonResponse({ error: "STRIPE_WEBHOOK_SECRET não configurado" }, 500);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return jsonResponse({ error: "Missing stripe-signature header" }, 400);
  }

  const payload = await req.text();

  let event: StripeType.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return jsonResponse({ error: "Invalid signature" }, 400);
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as StripeType.Subscription;
        await upsertSubscription(event, subscription);
        break;
      }
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.payment_action_required": {
        const invoice = event.data.object as StripeType.Invoice;
        await handleInvoiceEvent(event, invoice);
        break;
      }
      default: {
        // Outros eventos apenas são registrados sem ação específica
        const { error } = await supabaseAdmin
          .from("subscription_events")
          .insert({
            subscription_id: null,
            stripe_event_id: event.id,
            event_type: event.type ?? "unknown",
            payload: event as Record<string, unknown>,
          });
        if (error) throw error;
      }
    }

    return jsonResponse({ received: true });
  } catch (err) {
    console.error("stripe-webhook handler error", err);
    const message = err?.message ?? "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
};

serve(handler);
