import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { stripe, STRIPE_PRICES, getQuotaForPlan } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    // Get the plan from request body
    const body = await req.json();
    const { plan, billingCycle } = body;

    if (!plan || !billingCycle) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Plan and billing cycle are required" } },
        { status: 400 }
      );
    }

    // Validate plan
    if (!["PRO", "ENTERPRISE"].includes(plan)) {
      return NextResponse.json(
        { error: { code: "INVALID_PLAN", message: "Invalid plan selected" } },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (!["monthly", "yearly"].includes(billingCycle)) {
      return NextResponse.json(
        { error: { code: "INVALID_BILLING_CYCLE", message: "Invalid billing cycle" } },
        { status: 400 }
      );
    }

    // Get the price ID for the selected plan and billing cycle
    const priceKey = `${plan}_${billingCycle.toUpperCase()}` as keyof typeof STRIPE_PRICES;
    const priceId = STRIPE_PRICES[priceKey];

    if (!priceId) {
      return NextResponse.json(
        {
          error: {
            code: "PRICE_NOT_FOUND",
            message: "Price ID not configured for this plan. Please contact support.",
          },
        },
        { status: 500 }
      );
    }

    // Connect to database
    await connectDB();

    // Get the user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || user.email,
        metadata: {
          userId: user._id.toString(),
        },
      });
      customerId = customer.id;

      // Update user with Stripe customer ID
      user.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    console.log(`[Stripe Checkout] Creating checkout session for user: ${user.email}`);
    console.log(`[Stripe Checkout] User ID: ${user._id.toString()}`);
    console.log(`[Stripe Checkout] Plan: ${plan}, Billing Cycle: ${billingCycle}`);
    console.log(`[Stripe Checkout] Price ID: ${priceId}`);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/checkout/canceled`,
      metadata: {
        userId: user._id.toString(),
        plan: plan,
        billingCycle: billingCycle,
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      customer_update: {
        address: "auto",
        name: "auto",
      },
    });

    console.log(`[Stripe Checkout] Checkout session created: ${checkoutSession.id}`);
    console.log(`[Stripe Checkout] Session metadata:`, checkoutSession.metadata);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: {
          code: "CHECKOUT_ERROR",
          message: "Failed to create checkout session",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
