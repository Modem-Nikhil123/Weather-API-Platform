import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { stripe, getQuotaForPlan, getPlanFromPriceId } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Invalid signature:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    console.log(`[Stripe] Event: ${event.type}`);

    await connectDB();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckout(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpsert(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoiceSuccess(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoiceFail(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log("Unhandled:", event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook Fatal:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

/* ---------------- CHECKOUT ---------------- */

async function handleCheckout(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] handleCheckout called`);
  console.log(`[Stripe Webhook] Session ID: ${session.id}`);
  console.log(`[Stripe Webhook] Session metadata:`, session.metadata);

  if (!session.metadata?.userId) {
    console.error(`[Stripe Webhook] ERROR: Missing userId in session metadata`);
    return;
  }

  console.log(`[Stripe Webhook] Looking for user with ID: ${session.metadata.userId}`);
  const user = await User.findById(session.metadata.userId);
  if (!user) {
    console.error(`[Stripe Webhook] ERROR: User not found with ID: ${session.metadata.userId}`);
    return;
  }

  console.log(`[Stripe Webhook] User found: ${user.email}, current plan: ${user.plan}`);
  console.log(`[Stripe Webhook] User _id: ${user._id}`);

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  console.log(`[Stripe Webhook] Subscription ID: ${subscriptionId}, Customer ID: ${customerId}`);

  // Expand subscription to get price
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);

  console.log(`[Stripe Webhook] Price ID: ${priceId}, Mapped plan: ${plan}`);

  const quota = getQuotaForPlan(plan);
  console.log(`[Stripe Webhook] Quota for plan ${plan}:`, quota);

  user.stripeCustomerId = customerId;
  user.stripeSubscriptionId = subscriptionId;
  user.stripePriceId = priceId;
  user.subscriptionStatus = "active";
  user.plan = plan;
  // Set current period end from subscription
  const sub = subscription as Stripe.Subscription & { current_period_end?: number };
  user.stripeCurrentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
  user.cancelAtPeriodEnd = subscription.cancel_at_period_end;
  user.dailyQuota = quota.dailyQuota;
  user.monthlyQuota = quota.monthlyQuota;

  console.log(`[Stripe Webhook] User object before save:`, {
    _id: user._id,
    email: user.email,
    plan: user.plan,
    subscriptionStatus: user.subscriptionStatus,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
    dailyQuota: user.dailyQuota,
    monthlyQuota: user.monthlyQuota,
  });

  console.log(`[Stripe Webhook] Saving user with updated plan: ${plan}`);
  try {
    const savedUser = await user.save();
    console.log(`[Stripe Webhook] User saved successfully. New plan: ${savedUser.plan}, Status: ${savedUser.subscriptionStatus}`);
    console.log(`[Stripe Webhook] Saved user _id: ${savedUser._id}`);
    console.log(`[Stripe Webhook] Database connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    console.log(`[Stripe Webhook] Database name: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`[Stripe Webhook] ERROR: Failed to save user to database:`, error);
    throw error;
  }
}

/* ---------------- SUBSCRIPTION UPSERT ---------------- */

async function handleSubscriptionUpsert(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] handleSubscriptionUpsert called`);
  const customerId = subscription.customer as string;
  console.log(`[Stripe Webhook] Looking for user with customerId: ${customerId}`);
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error(`[Stripe Webhook] ERROR: User not found with customerId: ${customerId}`);
    return;
  }

  console.log(`[Stripe Webhook] User found: ${user.email}, current plan: ${user.plan}`);

  const priceId = subscription.items.data[0].price.id;
  const plan = getPlanFromPriceId(priceId);
  const quota = getQuotaForPlan(plan);

  console.log(`[Stripe Webhook] Price ID: ${priceId}, Mapped plan: ${plan}`);

  user.stripeSubscriptionId = subscription.id;
  user.stripePriceId = priceId;
  user.subscriptionStatus = subscription.status;
  user.plan = plan;
  // Access current_period_end with type assertion to handle Stripe type definition issues
  const sub = subscription as Stripe.Subscription & { current_period_end?: number };
  user.stripeCurrentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
  user.cancelAtPeriodEnd = subscription.cancel_at_period_end;
  user.dailyQuota = quota.dailyQuota;
  user.monthlyQuota = quota.monthlyQuota;

  console.log(`[Stripe Webhook] Saving user with updated plan: ${plan}`);
  try {
    await user.save();
    console.log(`[Stripe Webhook] User saved successfully. New plan: ${user.plan}, Status: ${user.subscriptionStatus}`);
  } catch (error) {
    console.error(`[Stripe Webhook] ERROR: Failed to save user to database:`, error);
    throw error;
  }
}

/* ---------------- SUBSCRIPTION DELETE ---------------- */

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] handleSubscriptionDeleted called`);
  const customerId = subscription.customer as string;
  console.log(`[Stripe Webhook] Looking for user with customerId: ${customerId}`);
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error(`[Stripe Webhook] ERROR: User not found with customerId: ${customerId}`);
    return;
  }

  console.log(`[Stripe Webhook] User found: ${user.email}, current plan: ${user.plan}`);

  const quota = getQuotaForPlan("FREE");

  user.subscriptionStatus = "canceled";
  user.plan = "FREE";
  user.stripeSubscriptionId = "";
  user.stripePriceId = "";
  user.stripeCurrentPeriodEnd = null;
  user.cancelAtPeriodEnd = false;
  user.dailyQuota = quota.dailyQuota;
  user.monthlyQuota = quota.monthlyQuota;

  console.log(`[Stripe Webhook] Saving user with FREE plan`);
  try {
    await user.save();
    console.log(`[Stripe Webhook] User saved successfully. New plan: ${user.plan}, Status: ${user.subscriptionStatus}`);
  } catch (error) {
    console.error(`[Stripe Webhook] ERROR: Failed to save user to database:`, error);
    throw error;
  }
}

/* ---------------- INVOICE SUCCESS ---------------- */

async function handleInvoiceSuccess(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] handleInvoiceSuccess called`);
  const customerId = invoice.customer as string;
  console.log(`[Stripe Webhook] Looking for user with customerId: ${customerId}`);
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error(`[Stripe Webhook] ERROR: User not found with customerId: ${customerId}`);
    return;
  }

  console.log(`[Stripe Webhook] User found: ${user.email}, current status: ${user.subscriptionStatus}`);

  if (user.subscriptionStatus === "past_due") {
    user.subscriptionStatus = "active";
    console.log(`[Stripe Webhook] Updating subscription status to active`);
    try {
      await user.save();
      console.log(`[Stripe Webhook] User saved successfully. New status: ${user.subscriptionStatus}`);
    } catch (error) {
      console.error(`[Stripe Webhook] ERROR: Failed to save user to database:`, error);
      throw error;
    }
  }
}

/* ---------------- INVOICE FAIL ---------------- */

async function handleInvoiceFail(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] handleInvoiceFail called`);
  const customerId = invoice.customer as string;
  console.log(`[Stripe Webhook] Looking for user with customerId: ${customerId}`);
  const user = await User.findOne({ stripeCustomerId: customerId });
  if (!user) {
    console.error(`[Stripe Webhook] ERROR: User not found with customerId: ${customerId}`);
    return;
  }

  console.log(`[Stripe Webhook] User found: ${user.email}, current status: ${user.subscriptionStatus}`);

  user.subscriptionStatus = "past_due";
  console.log(`[Stripe Webhook] Updating subscription status to past_due`);
  try {
    await user.save();
    console.log(`[Stripe Webhook] User saved successfully. New status: ${user.subscriptionStatus}`);
  } catch (error) {
    console.error(`[Stripe Webhook] ERROR: Failed to save user to database:`, error);
    throw error;
  }
}
