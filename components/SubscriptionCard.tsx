"use client";

import { useState, useEffect } from "react";
import { FiCheck, FiX, FiLoader, FiAlertCircle } from "react-icons/fi";

interface SubscriptionData {
  plan: string;
  subscriptionStatus: string | null;
  dailyQuota: number;
  monthlyQuota: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  subscriptionDetails: {
    id: string;
    status: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    cancelAt: Date | null;
    items: Array<{
      id: string;
      priceId: string;
      amount: number;
      currency: string;
      interval: string;
    }>;
  } | null;
  upcomingInvoice: {
    amount: number;
    currency: string;
    dueDate: Date | null;
  } | null;
}

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch("/api/subscription/status");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch subscription status");
      }

      setSubscription(data);
    } catch (err) {
      console.error("Error fetching subscription status:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch subscription status");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (immediate: boolean) => {
    setCanceling(true);
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ immediate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to cancel subscription");
      }

      // Refresh subscription status
      await fetchSubscriptionStatus();
      setShowCancelConfirm(false);
    } catch (err) {
      console.error("Error canceling subscription:", err);
      alert(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-center py-8">
          <FiLoader className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="flex items-center text-red-600 mb-4">
          <FiAlertCircle className="w-5 h-5 mr-2" />
          <span className="font-medium">Error</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const isFreePlan = subscription.plan === "FREE";
  const isActive = subscription.subscriptionStatus === "active";
  const isPastDue = subscription.subscriptionStatus === "past_due";
  const isCanceled = subscription.subscriptionStatus === "canceled";
  const willCancelAtPeriodEnd = subscription.cancelAtPeriodEnd;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Subscription
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isFreePlan
              ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              : isActive
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : isPastDue
              ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
              : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
          }`}
        >
          {isFreePlan
            ? "Free Plan"
            : isActive
            ? "Active"
            : isPastDue
            ? "Past Due"
            : isCanceled
            ? "Canceled"
            : subscription.subscriptionStatus}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Current Plan
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {subscription.plan}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Daily Quota
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {subscription.dailyQuota === Infinity
                ? "Unlimited"
                : subscription.dailyQuota.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Monthly Quota
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {subscription.monthlyQuota === Infinity
                ? "Unlimited"
                : subscription.monthlyQuota.toLocaleString()}
            </p>
          </div>
        </div>

        {!isFreePlan && subscription.stripeCurrentPeriodEnd && (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {willCancelAtPeriodEnd
                ? "Subscription Ends"
                : "Next Billing Date"}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(subscription.stripeCurrentPeriodEnd).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        )}

        {!isFreePlan && subscription.upcomingInvoice && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Upcoming Invoice
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              $
              {(subscription.upcomingInvoice.amount / 100).toFixed(2)}{" "}
              {subscription.upcomingInvoice.currency.toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {!isFreePlan && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {willCancelAtPeriodEnd ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">
                    Subscription will be canceled
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your subscription will end on{" "}
                    {subscription.stripeCurrentPeriodEnd &&
                      new Date(
                        subscription.stripeCurrentPeriodEnd
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    . You can reactivate it before then.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors"
            >
              Cancel Subscription
            </button>
          )}

          {showCancelConfirm && (
            <div className="mt-4 space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Are you sure you want to cancel your subscription?
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCancelSubscription(false)}
                    disabled={canceling}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canceling ? (
                      <>
                        <FiLoader className="w-4 h-4 mr-2 animate-spin inline" />
                        Canceling...
                      </>
                    ) : (
                      "Cancel at End of Period"
                    )}
                  </button>
                  <button
                    onClick={() => handleCancelSubscription(true)}
                    disabled={canceling}
                    className="w-full px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {canceling ? (
                      <>
                        <FiLoader className="w-4 h-4 mr-2 animate-spin inline" />
                        Canceling...
                      </>
                    ) : (
                      "Cancel Immediately"
                    )}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={canceling}
                    className="w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Keep Subscription
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isFreePlan && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <a
            href="/pricing"
            className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Upgrade Plan
          </a>
        </div>
      )}
    </div>
  );
}
