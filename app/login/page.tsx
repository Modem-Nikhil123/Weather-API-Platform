"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { FiCloud, FiSun, FiCode, FiZap, FiShield } from "react-icons/fi";
import Navbar from "@/components/Navbar";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text */}
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Get Your API Key
              <span className="block text-blue-600">Start Building Today</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Sign in to access your developer dashboard, manage API keys, and monitor usage.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Free API Key</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get started with 1,000 requests/day</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FiZap className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Instant Access</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start making API calls immediately</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FiShield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Secure</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">OAuth authentication with Google</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Already have an account?</strong> Just sign in to access your dashboard.
              </p>
            </div>
          </div>

          {/* Right Side - Sign In Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FiCloud className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sign in to WeatherAPI
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Access your developer dashboard
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <FiSun className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Real-time weather data
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCode className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  RESTful API endpoints
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FiCloud className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Rate limiting & analytics
                </span>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 dark:border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                  </svg>
                  Continue with Google
                </div>
              )}
            </button>
            <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>

            {/* Back to Home */}
            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
