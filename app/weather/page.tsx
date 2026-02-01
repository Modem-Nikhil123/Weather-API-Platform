"use client";

import { useState } from "react";
import { FiSearch, FiCloud, FiThermometer, FiDroplet, FiWind, FiRefreshCw } from "react-icons/fi";
import Navbar from "@/components/Navbar";
import Link from "next/link";
export default function WeatherDemo() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchWeather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    setError("");
    setWeatherData(null);

    try {
      const response = await fetch(`/api/weather/demo?city=${encodeURIComponent(city.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch weather data");
      }

      setWeatherData(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchWeather();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Live Weather Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Try our API in real-time. Enter a city name to see current weather data.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
                placeholder="Enter city name (e.g., London, New York, Tokyo)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              onClick={searchWeather}
              disabled={!city.trim() || loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FiSearch className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Weather Card */}
        {weatherData && (
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-blue-100 text-sm mb-1">Current Weather</p>
                <h2 className="text-4xl font-bold">{weatherData.city}</h2>
                <p className="text-blue-100 text-sm">
                  Last updated: {new Date(weatherData.timestamp).toLocaleString()}
                </p>
              </div>
              <FiCloud className="w-20 h-20 text-blue-200" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <FiThermometer className="w-8 h-8 text-blue-600 mr-3" />
                  <span className="text-blue-100 text-sm">Temperature</span>
                </div>
                <p className="text-4xl font-bold text-white">{weatherData.temperature}°C</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <FiDroplet className="w-8 h-8 text-blue-600 mr-3" />
                  <span className="text-blue-100 text-sm">Humidity</span>
                </div>
                <p className="text-4xl font-bold text-white">{weatherData.humidity}%</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <FiWind className="w-8 h-8 text-blue-600 mr-3" />
                  <span className="text-blue-100 text-sm">Wind Speed</span>
                </div>
                <p className="text-4xl font-bold text-white">{weatherData.windSpeed} km/h</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <FiCloud className="w-8 h-8 text-blue-600 mr-3" />
                  <span className="text-blue-100 text-sm">Pressure</span>
                </div>
                <p className="text-4xl font-bold text-white">{weatherData.pressure} hPa</p>
              </div>
            </div>
          </div>
        )}

        {/* API Call Example */}
        {weatherData && (
          <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-mono mb-4">API Call Example</p>
            <pre className="text-sm text-gray-300 font-mono overflow-x-auto">{`GET /api/weather/demo?city=${weatherData.city}

Response:
{
  "city": "${weatherData.city}",
  "temperature": ${weatherData.temperature},
  "humidity": ${weatherData.humidity},
  "windSpeed": ${weatherData.windSpeed},
  "pressure": ${weatherData.pressure},
  "timestamp": "${weatherData.timestamp}"
}`}</pre>
          </div>
        )}

        {/* Powered By */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Powered by <span className="font-semibold text-blue-600">WeatherAPI</span>
          </p>
          <Link
            href="/docs"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            View API Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
