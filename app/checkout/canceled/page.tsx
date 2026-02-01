"use client";

import Link from "next/link";
import { FiXCircle, FiArrowRight } from "react-icons/fi";
import Navbar from "@/components/Navbar";

export default function CheckoutCanceledPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full mb-6">
            <FiXCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Canceled
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Your payment was canceled. No charges were made to your account.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What happened?
            </h2>
            <p className="text-left text-gray-600 dark:text-gray-400 mb-4">
              You closed the payment window before completing the purchase. Your
              account remains on the current plan.
            </p>

            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Need help?
            </h2>
            <ul className="text-left space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Try the checkout process again</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Contact support if you encountered an error</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Check your payment method details</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link
              href="/pricing"
              className="block w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
              <FiArrowRight className="ml-2" />
            </Link>

            <Link
              href="/dashboard"
              className="block w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
