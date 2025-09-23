import { serve } from "https://deno.land/std@0.200.0/http/server.ts";
import { supabaseAdmin } from "../_shared/supabaseClient.ts";
import { stripe } from "../_shared/stripe.ts";
import { corsHeaders, jsonResponse } from "../_shared/responses.ts";

interface RequestBody {
  companyId?: string;
  email?: string;
  name?: string;
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
    const companyId = body.companyId;
    const email = body.email;

    if (!companyId || !email) {
      return jsonResponse({ error: "companyId and email are required" }, 400);
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .select("id, stripe_customer_id")
      .eq("id", companyId)
      .maybeSingle();

    if (companyError) {
      throw companyError;
    }

    if (!company) {
      return jsonResponse({ error: "Company not found" }, 404);
    }

    if (company.stripe_customer_id) {
      return jsonResponse({ stripeCustomerId: company.stripe_customer_id });
    }

    const customer = await stripe.customers.create({
      email,
      name: body.name ?? undefined,
      metadata: {
        company_id: companyId,
      },
    });

    const insertResult = await supabaseAdmin
      .from("stripe_customers")
      .insert({
        company_id: companyId,
        stripe_customer_id: customer.id,
        metadata: customer.metadata ?? {},
      });

    if (insertResult.error) {
      throw insertResult.error;
    }

    const updateResult = await supabaseAdmin
      .from("companies")
      .update({ stripe_customer_id: customer.id })
      .eq("id", companyId);

    if (updateResult.error) {
      throw updateResult.error;
    }

    return jsonResponse({ stripeCustomerId: customer.id });
  } catch (error) {
    console.error("create-stripe-customer error", error);
    const message = error?.message ?? "Unexpected error";
    return jsonResponse({ error: message }, 500);
  }
};

serve(handler);
