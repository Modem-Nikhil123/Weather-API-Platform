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
