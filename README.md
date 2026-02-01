# 🌦️ Weather API Platform

### Subscription-Based SaaS for Weather Data Access

A **developer-focused, production-grade Weather Data API platform** that demonstrates how to design, secure, meter, and monetize REST APIs at scale.  
The platform provides real-time, historical, and aggregated weather data via subscription-controlled API access, with enforced rate limits, usage analytics, and fault-tolerant ingestion.

> **Note:** Weather data is used as a reference dataset. The core focus of this project is **API lifecycle management, billing integration, quota enforcement, and reliability**, similar to real-world SaaS API products.

---

## 🚀 Key Features

### 🔐 Authentication & Access Control

- Google OAuth using NextAuth.js for user authentication
- Secure API key–based authentication for programmatic access
- Separation of human access (OAuth) and machine access (API keys)
- Plan-based authorization tied to active subscription status

---

### 💳 Subscription & Billing (Stripe)

- Subscription plans: **FREE / PRO / ENTERPRISE**
- Stripe Checkout for subscription onboarding
- Webhook-driven subscription lifecycle management:
  - Subscription creation, updates, and cancellations
  - Payment success and failure handling
- Automatic quota updates based on subscription state
- Billing system as the single source of truth for API access

---

### 📈 Rate Limiting & Usage Tracking

- Per-API-key **daily and hourly rate limits**
- Persistent usage tracking for:
  - Billing accuracy
  - Auditability
  - Analytics
- Rate limit response headers:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `Retry-After`

---

### ⚡ Weather Data APIs

- **Current Weather API** – real-time weather data retrieval
- **Historical Weather API** – time-range based queries
- **Daily Average Weather API** – aggregated temperature analytics
- **Weather Analytics API** – per-endpoint usage insights
- Automatic city validation and tracking using geocoding

---

### 🧠 Caching & Fault Tolerance

- Multi-tier caching strategy:
  1. In-memory cache (best-effort, low-latency)
  2. Database fallback
  3. External weather API fetch
- Configurable TTLs per endpoint
- Graceful degradation with stale-data fallback during upstream API failures

---

### 🔄 Automated Weather Ingestion

- **Cron-based background ingestion every 10 minutes**
- Batch processing for tracked cities
- Automatic city deactivation after repeated ingestion failures
- Ensures near-real-time data freshness while controlling external API usage

---

### 📊 Developer Dashboard

- API key generation and management
- Subscription status and quota visibility
- Real-time usage statistics
- Quick access to API documentation and testing tools

---

---

### Design Principles

- Correctness over raw throughput
- Billing-safe usage tracking
- Explicit trade-offs for serverless environments
- Fault-tolerant external API integration

---

## 🛠️ Tech Stack

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Redux Toolkit

### Backend

- Next.js API Routes
- Node.js
- Mongoose (MongoDB ODM)

### Database

- MongoDB

### Authentication

- NextAuth.js (Google OAuth)
- API Key–based authentication

### Payments

- Stripe (Subscriptions & Webhooks)

### External Services

- Open-Meteo Weather API
- Geocoding API

### Deployment

- Vercel (Serverless Functions & Cron Jobs)

---

## 🧩 Database Models (Simplified)

### User

- Authentication and subscription metadata
- Plan and quota configuration
- Stripe customer and subscription identifiers

### Weather

- City metadata
- Weather measurements
- Timestamped observations

### Usage

- API key
- Endpoint
- Date-based request counts

### TrackedCity

- City coordinates and metadata
- Fetch count and last fetched timestamp
- Active / inactive status

---

## 📌 Why This Project Matters

This project goes beyond a basic weather application by addressing **real-world SaaS API challenges**, including:

- Subscription-controlled access
- Accurate quota enforcement
- Usage-based billing alignment
- Fault-tolerant data ingestion
- Developer-first API design

It serves as a **reference architecture** for building monetized data APIs in production environments.

---

## 📎 Future Enhancements

- Distributed rate limiting using Redis
- API key hashing and rotation policies
- Usage-based (metered) billing
- Webhook event replay and retry mechanisms
- Multi-region ingestion support

---
