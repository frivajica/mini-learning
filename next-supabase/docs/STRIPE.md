# Stripe Integration

## Overview

This project integrates Stripe for handling monthly subscription payments. The integration follows Stripe's recommended practices for subscription billing.

## Architecture

### Flow

1. **User subscribes** → Create Stripe Checkout Session
2. **Payment succeeds** → Stripe webhook updates subscription status
3. **User manages subscription** → Stripe Customer Portal
4. **Subscription renews/cancels** → Webhook handles status updates

### Database Schema

```typescript
// src/lib/supabase/types.ts
export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: "active" | "canceled" | "past_due" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}
```

## Server Actions

### Create Checkout Session

```typescript
// src/actions/subscriptions.ts
"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { createCustomer, createSubscription, STRIPE_PLANS } from "@/lib/stripe";
import { getUserProfile } from "@/lib/supabase/queries";
import { revalidatePath } from "next/cache";

export async function createCheckoutSession(plan: "pro") {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

  const profile = await getUserProfile();
  if (!profile) return { error: "Profile not found" };

  // Get or create Stripe customer
  let customerId = profile.stripe_customer_id;
  if (!customerId) {
    const customer = await createCustomer(
      user.email!,
      profile.full_name || undefined,
    );
    customerId = customer.id;

    // Save customer ID to profile
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  // Create subscription
  const subscription = await createSubscription(
    customerId,
    STRIPE_PLANS[plan].priceId,
  );

  // Save subscription to database
  const supabase = await createClient();
  await supabase.from("subscriptions").insert({
    user_id: user.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: STRIPE_PLANS[plan].priceId,
    status: subscription.status,
    current_period_start: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    current_period_end: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
  });

  revalidatePath("/dashboard/settings");

  // Redirect to Stripe Checkout
  const sessionId = (subscription.latest_invoice as any)?.payment_intent?.id;
  return { sessionId, subscriptionId: subscription.id };
}
```

### Stripe Client

```typescript
// src/lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const STRIPE_PLANS = {
  pro: {
    name: "Pro Plan",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 9.99,
    interval: "month" as const,
  },
};

export async function createCustomer(email: string, name?: string) {
  return stripe.customers.create({ email, name });
}

export async function createSubscription(customerId: string, priceId: string) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
}
```

## Webhook Handling

### API Route

```typescript
// src/app/api/webhooks/stripe/route.ts
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response("Webhook Error", { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Handle successful checkout
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000,
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000,
          ).toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscriptions")
        .update({ status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return new Response(null, { status: 200 });
}
```

## Customer Portal

### Create Portal Session

```typescript
export async function createPortalSession() {
  const user = await getUser();
  if (!user) return { error: "Not authenticated" };

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
```

## UI Components

### Subscription Card

```typescript
// src/app/(dashboard)/settings/page.tsx
"use client";

export default function SettingsPage() {
  const { data: subscription } = useSubscription();

  const isPro = subscription?.status === "active";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {isPro ? (
          <div className="space-y-4">
            <Badge>Pro Plan - Active</Badge>
            <p>Your subscription renews on {formatDate(subscription.current_period_end)}</p>
            <Button variant="outline" onClick={handleManageSubscription}>
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3>Pro Plan - $9.99/month</h3>
              <ul>
                <li>✓ Unlimited tasks</li>
                <li>✓ Real-time sync</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
            <Button onClick={handleSubscribe}>
              Subscribe to Pro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

## Testing

### Stripe CLI

```bash
# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Test Cards

| Card Number      | Use Case                |
| ---------------- | ----------------------- |
| 4242424242424242 | Successful payment      |
| 4000000000000002 | Failed payment          |
| 4000002500003155 | Requires authentication |

## Security Best Practices

1. **Verify Webhook Signatures** - Always validate `stripe-signature` header
2. **Use Service Role Key for Webhooks** - Never use anon key server-side
3. **Store Minimal Card Data** - Never store card numbers, use Stripe Customer IDs
4. **Handle All Events Idempotently** - Check if subscription already exists before inserting

## Stripe Dashboard

Monitor subscriptions and payments at: https://dashboard.stripe.com
