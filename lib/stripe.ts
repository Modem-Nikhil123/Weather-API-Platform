import Stripe from 'stripe';

// Initialize Stripe with your secret key
// In production, this should be stored in environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecretKey) {
  console.warn('Warning: STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-01-28.clover',
  typescript: true,
});

// Stripe Price IDs - These should be set in your Stripe dashboard
export const STRIPE_PRICES = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || '',
  ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
  ENTERPRISE_YEARLY: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',
};

// Plan configurations
export const PLAN_CONFIGS = {
  FREE: {
    name: 'Free',
    dailyQuota: 1000,
    monthlyQuota: 30000,
    features: [
      '1,000 requests/day',
      'Current weather data',
      'Basic rate limiting',
      'Community support',
    ],
  },
  PRO: {
    name: 'Pro',
    dailyQuota: 50000,
    monthlyQuota: 1500000,
    features: [
      '50,000 requests/day',
      'Current & historical data',
      'Advanced rate limiting',
      'Email support',
      'API analytics dashboard',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    dailyQuota: Infinity,
    monthlyQuota: Infinity,
    features: [
      'Unlimited requests',
      'All data types included',
      'Custom rate limits',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
};

// Helper function to get plan config
export function getPlanConfig(plan: string) {
  return PLAN_CONFIGS[plan as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.FREE;
}

// Helper function to update user quota based on plan
export function getQuotaForPlan(plan: string) {
  const config = getPlanConfig(plan);
  return {
    dailyQuota: config.dailyQuota,
    monthlyQuota: config.monthlyQuota,
  };
}

// Helper function to get plan name from Stripe price ID
export function getPlanFromPriceId(priceId: string): string {
  const prices = STRIPE_PRICES;
  
  if (priceId === prices.PRO_MONTHLY || priceId === prices.PRO_YEARLY) {
    return 'PRO';
  }
  
  if (priceId === prices.ENTERPRISE_MONTHLY || priceId === prices.ENTERPRISE_YEARLY) {
    return 'ENTERPRISE';
  }
  
  // Default to FREE if no match found
  return 'FREE';
}
