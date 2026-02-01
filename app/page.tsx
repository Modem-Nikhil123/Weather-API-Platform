"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowRight, FiZap, FiShield, FiCode, FiCopy, FiCloud, FiThermometer, FiDroplet, FiWind } from "react-icons/fi";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetch sample weather data for demo
    const fetchSampleWeather = async () => {
      try {
        const response = await fetch("/api/weather/demo?city=London");
        if (response.ok) {
          const data = await response.json();
          setWeatherData(data);
        }
      } catch (error) {
        console.error("Error fetching sample weather:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSampleWeather();
  }, []);

  const copyCode = () => {
    const code = `curl -X GET "https://api.weatherplatform.com/api/weather/current?city=London" \\
  -H "x-api-key: YOUR_API_KEY"`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text */}
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Real-time Weather API for Developers.
              <span className="block text-blue-600">Fast. Reliable. Scalable.</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Get instant access to accurate weather data for any location worldwide. 
              Built for developers who need reliable weather data in their applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {session ? (
                <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Go to Dashboard
                  <FiArrowRight className="ml-2" />
                </Link>
              ) : (
                <Link href="/login" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Get API Key
                  <FiArrowRight className="ml-2" />
                </Link>
              )}
              <Link href="/docs" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                View Docs
              </Link>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FiZap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Lightning Fast</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">100ms response</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <FiShield className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">99.9% Uptime</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reliable service</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <FiCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">RESTful API</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Easy integration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="space-y-6">
            {/* Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm">Current Weather</p>
                  <p className="text-2xl font-bold">{loading ? 'Loading...' : weatherData?.city || 'London'}</p>
                </div>
                <FiCloud className="w-12 h-12 text-blue-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-100 text-sm">Temperature</p>
                  <p className="text-3xl font-bold">{loading ? '--' : weatherData?.temperature || '--'}°C</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Humidity</p>
                  <p className="text-3xl font-bold">{loading ? '--' : weatherData?.humidity || '--'}%</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Wind</p>
                  <p className="text-3xl font-bold">{loading ? '--' : weatherData?.windSpeed || '--'} km/h</p>
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Pressure</p>
                  <p className="text-3xl font-bold">{loading ? '--' : weatherData?.pressure || '--'} hPa</p>
                </div>
              </div>
            </div>

            {/* API Response Preview */}
            <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400 text-sm font-mono">API Response</p>
                <button
                  onClick={copyCode}
                  className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                  <FiCopy className="mr-1" />
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
{`{
  "city": "London",
  "temperature": ${weatherData?.temperature || 15.5},
  "humidity": ${weatherData?.humidity || 72},
  "windSpeed": ${weatherData?.windSpeed || 12.3},
  "pressure": ${weatherData?.pressure || 1013},
  "timestamp": "${new Date().toISOString()}"
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to integrate weather data?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get your free API key and start building in minutes.
          </p>
          {session ? (
            <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors">
              Go to Dashboard
              <FiArrowRight className="ml-2" />
            </Link>
          ) : (
            <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors">
              Get Started Free
              <FiArrowRight className="ml-2" />
            </Link>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © 2024 WeatherAPI. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                Documentation
              </Link>
              <Link href="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                Pricing
              </Link>
              <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">
                Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
