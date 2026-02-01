"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FiCheck, FiZap, FiShield, FiHeadphones, FiLoader } from "react-icons/fi";
import Navbar from "@/components/Navbar";

export default function PricingPage() {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [paymentGateway, setPaymentGateway] = useState<"stripe" | "razorpay">("stripe");
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");

  useEffect(() => {
    // Detect user's country to determine payment gateway
    // In a real app, you would get this from user's profile or IP geolocation
    // For now, we'll use a simple check based on timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const isIndia = timezone?.includes("Kolkata") || timezone?.includes("India");

    if (isIndia) {
      setPaymentGateway("razorpay");
      setCurrency("INR");
    } else {
      setPaymentGateway("stripe");
      setCurrency("USD");
    }
  }, []);

  const handleSubscribe = async (plan: string, billingCycle: string) => {
    const key = `${plan}-${billingCycle}`;
    setLoading((prev: any) => ({ ...prev, [key]: true }));

    try {
      // Use different API endpoint based on payment gateway
      const endpoint = paymentGateway === "razorpay"
        ? "/api/checkout/razorpay-create-order"
        : "/api/checkout/create-checkout-session";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, billingCycle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to create checkout session");
      }

      // Handle different payment gateways
      if (paymentGateway === "razorpay") {
        // For Razorpay, redirect to success page
        // The actual payment will be handled by Razorpay checkout
        // and confirmed via webhook
        window.location.href = `/checkout/success?gateway=razorpay&orderId=${data.orderId}`;
      } else {
        // For Stripe, redirect to checkout URL
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert(error instanceof Error ? error.message : "Failed to create checkout session");
    } finally {
      if (paymentGateway === "stripe") {
        setLoading((prev: any) => ({ ...prev, [key]: false }));
      }
    }
  };

  const getPlanPrice = (plan: string, billingCycle: string) => {
    if (currency === "INR") {
      const prices: Record<string, Record<string, string>> = {
        PRO: {
          monthly: "₹2,900",
          yearly: "₹29,000",
        },
        ENTERPRISE: {
          monthly: "₹9,900",
          yearly: "₹99,000",
        },
      };
      return prices[plan][billingCycle];
    } else {
      const prices: Record<string, Record<string, string>> = {
        PRO: {
          monthly: "$29",
          yearly: "$290",
        },
        ENTERPRISE: {
          monthly: "$99",
          yearly: "$990",
        },
      };
      return prices[plan][billingCycle];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose a plan that fits your needs. Start free, scale as you grow.
          </p>
          <div className="mt-4 inline-flex items-center justify-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Payment Gateway: <span className="font-semibold text-blue-600 dark:text-blue-400">{paymentGateway === "razorpay" ? "Razorpay" : "Stripe"}</span>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Currency: <span className="font-semibold text-blue-600 dark:text-blue-400">{currency}</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">For testing and small projects</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">$0</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">1,000 requests/day</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Current weather data</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Basic rate limiting</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Community support</span>
              </li>
            </ul>
            <Link
              href="/login"
              className="block w-full text-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg font-medium transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-blue-600 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">For growing applications</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{getPlanPrice("PRO", "monthly")}</span>
              <span className="text-gray-600 dark:text-gray-400">/month</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">50,000 requests/day</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Current & historical data</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Advanced rate limiting</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Email support</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">API analytics dashboard</span>
              </li>
            </ul>
            <div className="space-y-3">
              <button
                onClick={() => handleSubscribe("PRO", "monthly")}
                disabled={loading["PRO-monthly"]}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading["PRO-monthly"] ? (
                  <>
                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Start Pro Monthly (${getPlanPrice("PRO", "monthly")}/mo)`
                )}
              </button>
              <button
                onClick={() => handleSubscribe("PRO", "yearly")}
                disabled={loading["PRO-yearly"]}
                className="w-full flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading["PRO-yearly"] ? (
                  <>
                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Start Pro Yearly (${getPlanPrice("PRO", "yearly")}/yr - Save 20%)`
                )}
              </button>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">For large-scale applications</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">Custom</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Unlimited requests</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">All data types included</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Custom rate limits</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Dedicated support</span>
              </li>
              <li className="flex items-start">
                <FiCheck className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">SLA guarantee</span>
              </li>
            </ul>
            <Link
              href="mailto:sales@weatherapi.com"
              className="block w-full text-center px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg font-medium transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <FiZap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Average response time under 100ms with global CDN distribution.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
              <FiShield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">99.9% Uptime</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Enterprise-grade reliability with automatic failover.
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
              <FiHeadphones className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Expert support available around the clock for all plans.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time from your dashboard.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I exceed my limit?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You'll receive a notification and can upgrade your plan. We won't charge overages.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, free plan is perfect for testing. Pro plans include a 14-day trial.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {paymentGateway === "razorpay" 
                  ? "We accept UPI, credit cards, debit cards, netbanking, and wallets."
                  : "We accept all major credit cards, PayPal, and bank transfers for enterprise plans."
                }
              </p>
            </div>
          </div>
        </div>

        
      </main>
    </div>
  );
}
