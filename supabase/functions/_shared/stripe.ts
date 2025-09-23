import Stripe from "npm:stripe@12.17.0";

const secret = Deno.env.get("STRIPE_SECRET_KEY");

if (!secret) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(secret, {
  apiVersion: "2023-10-16",
});
