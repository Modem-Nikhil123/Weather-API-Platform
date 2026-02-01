"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiCheckCircle, FiArrowRight } from "react-icons/fi";
import Navbar from "@/components/Navbar";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("Invalid session ID");
      setLoading(false);
      return;
    }

    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);

    setLoading(false);

    return () => clearTimeout(timer);
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Processing your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-4">
              <FiCheckCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-6">
            <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Thank you for your subscription. Your account has been upgraded.
          </p>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              What's Next?
            </h2>
            <ul className="text-left space-y-3 text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Your API quota has been increased</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>You can now access premium features</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Manage your subscription in the dashboard</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Redirecting to dashboard in 3 seconds...
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Go to Dashboard
            <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
