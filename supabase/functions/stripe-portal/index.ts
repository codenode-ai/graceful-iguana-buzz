import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { stripe } from "../_shared/stripe.ts";
import { corsHeaders, jsonResponse } from "../_shared/responses.ts";

interface RequestBody {
  companyId?: string;
  returnUrl?: string;
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
    const { companyId, returnUrl } = body;

    if (!companyId || !returnUrl) {
      return jsonResponse({ error: "companyId e returnUrl são obrigatórios" }, 400);
    }

    const { data: customerRow, error } = await supabaseAdmin
      .from("stripe_customers")
      .select("stripe_customer_id")
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!customerRow?.stripe_customer_id) {
      return jsonResponse({ error: "Empresa não possui cliente Stripe" }, 400);
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: customerRow.stripe_customer_id,
      return_url: returnUrl,
    });

    return jsonResponse({ url: portal.url });
  } catch (err) {
    console.error("stripe-portal error", err);
    const message = err?.message ?? "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
};

serve(handler);
