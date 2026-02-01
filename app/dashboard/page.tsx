"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUser } from "@/store/slices/userSlice";
import { FiKey, FiCopy, FiCheck, FiTrendingUp, FiGlobe, FiClock, FiRefreshCw } from "react-icons/fi";
import Link from "next/link";
import SubscriptionCard from "@/components/SubscriptionCard";

export default function Dashboard() {
  const [copied, setCopied] = useState(false);
  const dispatch = useAppDispatch();
  const { apiKey, usageToday, usageLimit, usageMonthly, email } = useAppSelector((s) => s.user);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const usagePercentage = Math.round((usageToday / usageLimit) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Developer Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your API keys and monitor usage
        </p>
      </div>

      {/* Subscription Card */}
      <SubscriptionCard />

      {/* API Key Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex items-center mb-4">
          <FiKey className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your API Key</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={copied ? "text" : "password"}
              value={apiKey || "Loading..."}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono"
            />
          </div>
          <button
            onClick={copyApiKey}
            disabled={!apiKey}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {copied ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
            <span className="ml-2">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
          Keep your API key secret. Never share it publicly or commit it to version control.
        </p>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {usageToday}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            of {usageLimit} requests
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {usagePercentage}% used
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FiGlobe className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">This Month</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {usageMonthly}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            total requests
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <FiClock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Plan</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Free
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            1,000 req/day limit
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/docs"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-4">
              <FiKey className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">View API Documentation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Learn how to integrate the API</p>
            </div>
          </Link>
          <Link
            href="/weather"
            className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-4">
              <FiRefreshCw className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Test the API</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Try the live weather demo</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Rate Limit Info */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Rate Limit Information
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Your current plan allows <strong>1,000 requests per day</strong>. Rate limits reset at midnight UTC.
        </p>
        <div className="flex items-center space-x-4">
          <Link
            href="/pricing"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            View pricing plans →
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Copy your API key</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the copy button above to get your API key
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Read the documentation</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check out our <Link href="/docs" className="text-blue-600 hover:text-blue-700">API docs</Link> for endpoints and examples
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Make your first request</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Try the <Link href="/weather" className="text-blue-600 hover:text-blue-700">live demo</Link> or use curl/Postman
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
