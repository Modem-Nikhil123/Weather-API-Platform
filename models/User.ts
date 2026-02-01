import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  image: String,
  plan: {
    type: String,
    default: "FREE",
    enum: ["FREE", "PRO", "ENTERPRISE"],
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  dailyQuota: {
    type: Number,
    default: 1000,
  },
  monthlyQuota: {
    type: Number,
    default: 30000,
  },
  // Stripe subscription fields
  stripeCustomerId: {
    type: String,
    unique: true,
    sparse: true,
  },
  stripeSubscriptionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  stripePriceId: {
    type: String,
  },
  stripeCurrentPeriodEnd: {
    type: Date,
  },
  subscriptionStatus: {
    type: String,
    enum: ["active", "past_due", "canceled", "unpaid", "trialing"],
    default: null,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
  // Razorpay subscription fields
  razorpayCustomerId: {
    type: String,
    unique: true,
    sparse: true,
  },
  razorpaySubscriptionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpayPaymentId: {
    type: String,
  },
  razorpayPlan: {
    type: String,
    enum: ["PRO", "ENTERPRISE"],
  },
  razorpayBillingCycle: {
    type: String,
    enum: ["monthly", "yearly"],
  },
  razorpayCurrentPeriodEnd: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default models.User || model("User", UserSchema);
