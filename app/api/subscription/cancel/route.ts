import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
      );
    }

    // Get request body
    const body = await req.json();
    const { immediate } = body;

    // Connect to database
    await connectDB();

    // Get user from database
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Check if user has an active subscription
    if (!user.stripeSubscriptionId || user.plan === "FREE") {
      return NextResponse.json(
        {
          error: {
            code: "NO_SUBSCRIPTION",
            message: "No active subscription found",
          },
        },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe
    if (immediate) {
      // Cancel immediately
      await stripe.subscriptions.cancel(user.stripeSubscriptionId);

      // Downgrade user to free plan immediately
      user.subscriptionStatus = "canceled";
      user.plan = "FREE";
      user.stripeSubscriptionId = "";
      user.stripePriceId = "";
      user.stripeCurrentPeriodEnd = null;
      user.cancelAtPeriodEnd = false;

      // Reset quota to free plan
      user.dailyQuota = 1000;
      user.monthlyQuota = 30000;

      await user.save();

      return NextResponse.json({
        message: "Subscription canceled immediately",
        plan: user.plan,
      });
    } else {
      // Cancel at period end
      const subscription = await stripe.subscriptions.update(
        user.stripeSubscriptionId,
        {
          cancel_at_period_end: true,
        }
      );

      user.cancelAtPeriodEnd = true;
      // Access current_period_end with type assertion to handle Stripe type definition issues
      const sub = subscription as Stripe.Subscription & { current_period_end?: number };
      user.stripeCurrentPeriodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      await user.save();

      return NextResponse.json({
        message: "Subscription will be canceled at end of billing period",
        cancelAt: sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : null,
      });
    }
  } catch (error) {
    console.error("Error canceling subscription:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: {
          code: "CANCEL_ERROR",
          message: "Failed to cancel subscription",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
