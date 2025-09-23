import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { stripe } from "../_shared/stripe.ts";
import { corsHeaders, jsonResponse } from "../_shared/responses.ts";

interface RequestBody {
  companyId?: string;
  priceId?: string;
  planCode?: string;
  successUrl?: string;
  cancelUrl?: string;
  mode?: "subscription" | "payment";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const body = (await req.json()) as RequestBody;
    const { companyId, priceId, successUrl, cancelUrl } = body;

    if (!companyId || !priceId || !successUrl || !cancelUrl) {
      return jsonResponse({ error: "companyId, priceId, successUrl e cancelUrl são obrigatórios" }, 400);
    }

    const { data: customerRow, error: customerError } = await supabaseAdmin
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("company_id", companyId)
      .maybeSingle();

    if (customerError) {
      throw customerError;
    }

    if (!customerRow?.stripe_customer_id) {
      return jsonResponse({ error: "Empresa não possui cliente Stripe" }, 400);
    }

    const { data: planRow } = await supabaseAdmin
      .from("plans")
      .select("id, code")
      .eq("stripe_price_id", priceId)
      .maybeSingle();

    const planCode = planRow?.code ?? body.planCode ?? "";

    const session = await stripe.checkout.sessions.create({
      customer: customerRow.stripe_customer_id,
      mode: body.mode ?? "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        company_id: companyId,
        plan_code: planCode,
      },
      subscription_data: {
        metadata: {
          company_id: companyId,
          plan_code: planCode,
        },
      },
    });

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("create-checkout-session error", error);
    const message = error?.message ?? "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
};

serve(handler);
