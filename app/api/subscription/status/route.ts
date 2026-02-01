import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function GET(req: NextRequest) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "You must be logged in" } },
        { status: 401 }
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

    // Get subscription details from Stripe if user has a subscription
    let subscriptionDetails = null;
    if (user.stripeSubscriptionId && user.stripeCustomerId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripeSubscriptionId
        ) as any;

        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          // Access properties that exist in the API but not in type definitions
          currentPeriodEnd: subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000) 
            : null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          cancelAt: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000)
            : null,
          items: subscription.items.data.map((item: any) => ({
            id: item.id,
            priceId: item.price.id,
            amount: item.price.unit_amount,
            currency: item.price.currency,
            interval: item.price.recurring?.interval,
          })),
        };
      } catch (error) {
        console.error("Error fetching subscription from Stripe:", error);
        // Continue without subscription details
      }
    }

    // Get upcoming invoice if subscription is active
    let upcomingInvoice = null;
    if (user.subscriptionStatus === "active" && user.stripeCustomerId) {
      try {
        // Use type assertion to access method not in Stripe type definitions
        const invoice = await (stripe.invoices as any).retrieveUpcoming({
          customer: user.stripeCustomerId,
        });

        upcomingInvoice = {
          amount: invoice.amount_due,
          currency: invoice.currency,
          dueDate: invoice.due_date
            ? new Date(invoice.due_date * 1000)
            : null,
        };
      } catch (error) {
        console.error("Error fetching upcoming invoice:", error);
        // Continue without upcoming invoice
      }
    }

    return NextResponse.json({
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus,
      dailyQuota: user.dailyQuota,
      monthlyQuota: user.monthlyQuota,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
      cancelAtPeriodEnd: user.cancelAtPeriodEnd,
      subscriptionDetails,
      upcomingInvoice,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        error: {
          code: "FETCH_ERROR",
          message: "Failed to fetch subscription status",
          details: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}
