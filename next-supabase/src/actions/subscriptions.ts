"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser, getUserProfile } from "@/lib/supabase/queries";
import {
  createCustomer,
  createSubscription,
  cancelSubscription as cancelStripeSubscription,
  stripe,
  STRIPE_PLANS,
  type StripePlan,
} from "@/lib/stripe";
import { revalidatePath } from "next/cache";

export async function createCheckoutSession(plan: StripePlan) {
  const user = await getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const profile = await getUserProfile();
  if (!profile) {
    return { error: "Profile not found" };
  }

  let customerId = profile.stripe_customer_id;

  if (!customerId) {
    const customer = await createCustomer(
      user.email!,
      profile.full_name || undefined,
    );
    customerId = customer.id;

    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const priceId = STRIPE_PLANS[plan].priceId;

  const subscription = await createSubscription(customerId, priceId);

  const supabase = await createClient();
  await supabase.from("subscriptions").insert({
    user_id: user.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status: subscription.status,
    current_period_start: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
  });

  revalidatePath("/dashboard/settings");

  const sessionId = (
    subscription.latest_invoice as { payment_intent?: { id?: string } }
  )?.payment_intent?.id;

  return { sessionId, subscriptionId: subscription.id };
}

export async function createPortalSession() {
  const user = await getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const profile = await getUserProfile();
  if (!profile?.stripe_customer_id) {
    return { error: "No subscription found" };
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  });

  return { url: session.url };
}

export async function cancelSubscription(subscriptionId: string) {
  const user = await getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await cancelStripeSubscription(subscriptionId);

  if (error) {
    return { error };
  }

  const supabase = await createClient();
  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("stripe_subscription_id", subscriptionId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/settings");
  return { success: true };
}
