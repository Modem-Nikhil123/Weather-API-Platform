"use client";

import { useState } from "react";
import { FiCopy, FiCheck, FiCode, FiKey, FiBook, FiAlertCircle } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Link from "next/link";
export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const codeExamples = {
    curl: `curl -X GET "https://api.weatherplatform.com/api/weather/current?city=London" \\
  -H "x-api-key: YOUR_API_KEY"`,
    javascript: `const response = await fetch(
  'https://api.weatherplatform.com/api/weather/current?city=London',
  {
    headers: {
      'x-api-key': 'YOUR_API_KEY'
    }
  }
);
const data = await response.json();`,
    python: `import requests

response = requests.get(
  'https://api.weatherplatform.com/api/weather/current',
  params={'city': 'London'},
  headers={'x-api-key': 'YOUR_API_KEY'}
)
data = response.json()`,
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-24 space-y-2">
              <a href="#authentication" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Authentication
              </a>
              <a href="#endpoints" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Endpoints
              </a>
              <a href="#parameters" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Parameters
              </a>
              <a href="#responses" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Responses
              </a>
              <a href="#errors" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Error Codes
              </a>
              <a href="#examples" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Code Examples
              </a>
            </nav>
          </aside>

          {/* Main Documentation */}
          <main className="lg:col-span-3 space-y-12">
            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                API Documentation
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Complete guide to integrating WeatherAPI into your applications.
              </p>
            </div>

            {/* Authentication */}
            <section id="authentication" className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <div className="flex items-center mb-6">
                <FiKey className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                All API requests require an API key in the <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">x-api-key</code> header.
              </p>
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm font-mono">Header</span>
                  <button
                    onClick={() => copyToClipboard('x-api-key: YOUR_API_KEY', 'auth-header')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FiCopy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="text-sm text-gray-300 font-mono">x-api-key: YOUR_API_KEY</pre>
              </div>
            </section>

            {/* Endpoints */}
            <section id="endpoints" className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <div className="flex items-center mb-6">
                <FiCode className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Endpoints</h2>
              </div>

              {/* Current Weather Endpoint */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 flex items-center">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">GET</span>
                  <code className="text-gray-900 dark:text-white font-mono">/api/weather/current</code>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Get current weather data for a specific city.</p>
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm font-mono">Example Request</span>
                      <button
                        onClick={() => copyToClipboard(codeExamples.curl, 'curl-example')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedCode === 'curl-example' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                      </button>
                    </div>
                    <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{codeExamples.curl}</pre>
                  </div>
                </div>
              </div>

              {/* Historical Weather Endpoint */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 flex items-center">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">GET</span>
                  <code className="text-gray-900 dark:text-white font-mono">/api/weather/history</code>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 dark:text-gray-400">Get historical weather data for a city.</p>
                </div>
              </div>

              {/* Daily Average Endpoint */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 flex items-center">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mr-3">GET</span>
                  <code className="text-gray-900 dark:text-white font-mono">/api/weather/daily-average</code>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 dark:text-gray-400">Get daily average weather data for a city.</p>
                </div>
              </div>
            </section>

            {/* Parameters */}
            <section id="parameters" className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <div className="flex items-center mb-6">
                <FiBook className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Query Parameters</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">Parameter</th>
                      <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">Type</th>
                      <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">Required</th>
                      <th className="text-left py-3 px-4 text-gray-900 dark:text-white font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">city</code></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">string</td>
                      <td className="py-3 px-4"><span className="text-red-600 font-medium">Yes</span></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">City name (e.g., London, New York)</td>
                    </tr>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <td className="py-3 px-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">hours</code></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">integer</td>
                      <td className="py-3 px-4"><span className="text-gray-500">No</span></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Number of hours for historical data (default: 24)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4"><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">date</code></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">string</td>
                      <td className="py-3 px-4"><span className="text-gray-500">No</span></td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">Date for daily average (format: YYYY-MM-DD)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Responses */}
            <section id="responses" className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <div className="flex items-center mb-6">
                <FiCode className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Response Format</h2>
              </div>
              <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm font-mono">Success Response (200)</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify({
                      city: "London",
                      temperature: 15.5,
                      humidity: 72,
                      windSpeed: 12.3,
                      pressure: 1013,
                      timestamp: "2024-01-15T10:30:00Z"
                    }, null, 2), 'response-example')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'response-example' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{`{
  "city": "London",
  "temperature": 15.5,
  "humidity": 72,
  "windSpeed": 12.3,
  "pressure": 1013,
  "timestamp": "2024-01-15T10:30:00Z"
}`}</pre>
              </div>
            </section>

            {/* Error Codes */}
            <section id="errors" className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <div className="flex items-center mb-6">
                <FiAlertCircle className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Error Codes</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded mr-4">401</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Unauthorized</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invalid or missing API key</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded mr-4">404</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Not Found</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">City not found</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded mr-4">429</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Too Many Requests</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rate limit exceeded</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-1 rounded mr-4">500</span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Internal Server Error</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Server error</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Code Examples */}
            <section id="examples" className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <div className="flex items-center mb-6">
                <FiCode className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code Examples</h2>
              </div>

              {/* JavaScript Example */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">JavaScript / TypeScript</h3>
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-mono">JavaScript</span>
                    <button
                      onClick={() => copyToClipboard(codeExamples.javascript, 'js-example')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedCode === 'js-example' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{codeExamples.javascript}</pre>
                </div>
              </div>

              {/* Python Example */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Python</h3>
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-mono">Python</span>
                    <button
                      onClick={() => copyToClipboard(codeExamples.python, 'python-example')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {copiedCode === 'python-example' ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                    </button>
                  </div>
                  <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{codeExamples.python}</pre>
                </div>
              </div>
            </section>

            
          </main>
        </div>
      </main>
    </div>
  );
}
