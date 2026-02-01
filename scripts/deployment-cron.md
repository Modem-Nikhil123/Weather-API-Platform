# Weather Data Ingestion - Cron Job Setup

This guide shows how to set up automated weather data ingestion every 10 minutes for different deployment platforms.

## 📋 Prerequisites

- Node.js environment with TypeScript support
- MongoDB connection
- Access to Open-Meteo API (free, no API key required)

## 🖥️ Local Development (Linux/Mac)

### Using Cron (Built-in)

```bash
# Make the setup script executable
chmod +x scripts/cron-setup.sh

# Run the setup script
./scripts/cron-setup.sh

# Verify cron job is active
crontab -l
```

**What it does:**

- Sets up cron job to run every 10 minutes: `*/10 * * * *`
- Logs output to `logs/weather-ingestion.log`
- Automatically handles existing cron jobs

### Manual Cron Setup

```bash
# Edit crontab
crontab -e

# Add this line (replace /path/to/project with your actual path)
*/10 * * * * cd /path/to/weather-platform && npx ts-node scripts/ingestWeather.ts >> logs/weather-ingestion.log 2>&1
```

## ☁️ Cloud Deployment Options

### 1. Vercel (Serverless Functions)

**Option A: Vercel Cron Jobs (Recommended)**

```javascript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/ingest-weather",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

Create `app/api/cron/ingest-weather/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { connectDB } from "@/lib/db";
import Weather from "@/models/Weather";

const cities = [
  { name: "Hyderabad", lat: 17.38, lon: 78.48 },
  { name: "Delhi", lat: 28.61, lon: 77.2 },
  { name: "Mumbai", lat: 19.07, lon: 72.87 },
];

export async function GET() {
  try {
    await connectDB();

    for (const city of cities) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m`;

      const res = await axios.get(url);
      const current = res.data.current;

      await Weather.create({
        city: city.name,
        lat: city.lat,
        lon: city.lon,
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        pressure: current.pressure_msl,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Weather data ingested",
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 });
  }
}
```

### 2. Railway

**Railway Cron Jobs:**

```bash
# In Railway dashboard:
# Settings → Cron Jobs → Add Cron Job
# Command: npx ts-node scripts/ingestWeather.ts
# Schedule: */10 * * * *
```

### 3. Render

**Render Cron Jobs:**

```yaml
# render.yaml
services:
  - type: web
    name: weather-platform
    envVars:
      - key: CRON_SCHEDULE
        value: "*/10 * * * *"
      - key: CRON_COMMAND
        value: "npx ts-node scripts/ingestWeather.ts"
```

### 4. AWS Lambda + EventBridge

**Lambda Function:**

```javascript
// index.js
const { execSync } = require("child_process");

exports.handler = async (event) => {
  try {
    execSync("cd /var/task && npx ts-node scripts/ingestWeather.ts");
    return { statusCode: 200, body: "Weather ingested successfully" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: "Ingestion failed" };
  }
};
```

**EventBridge Rule:**

- Schedule: `rate(10 minutes)`
- Target: Your Lambda function

### 5. GitHub Actions (Free)

Create `.github/workflows/ingest-weather.yml`:

```yaml
name: Weather Data Ingestion

on:
  schedule:
    - cron: "*/10 * * * *" # Every 10 minutes
  workflow_dispatch: # Manual trigger

jobs:
  ingest:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run ingestion
        run: npx ts-node scripts/ingestWeather.ts
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

### 6. Docker + Cron

**Dockerfile:**

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

# Install cron
RUN apk add --no-cache dcron

# Create cron job
RUN echo "*/10 * * * * cd /app && npx ts-node scripts/ingestWeather.ts >> /var/log/weather.log 2>&1" > /etc/crontabs/root

CMD ["crond", "-f", "-l", "8"]
```

## 🔍 Monitoring & Logs

### Check Logs

```bash
# Local development
tail -f logs/weather-ingestion.log

# Docker
docker logs <container-name>

# Cloud platforms - check their logging dashboards
```

### Health Check

```bash
# Check recent weather data
mongosh --eval "db.weather.find().sort({timestamp: -1}).limit(5)"
```

## ⚡ Performance Optimization

### Database Indexing

```javascript
// Ensure proper indexes for queries
db.weather.createIndex({ city: 1, timestamp: -1 });
db.weather.createIndex({ timestamp: -1 });
```

### Error Handling

- Network timeouts for Open-Meteo API
- MongoDB connection retries
- Graceful failure handling

### Rate Limiting

- Respect Open-Meteo API limits (free tier: 10,000 calls/day)
- Implement exponential backoff for failures

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] MongoDB connection tested
- [ ] Open-Meteo API accessible
- [ ] Logs directory created
- [ ] Cron job scheduled
- [ ] Monitoring alerts set up
- [ ] Backup strategy in place

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**: Make scripts executable

   ```bash
   chmod +x scripts/*.sh
   ```

2. **TypeScript Not Found**: Install ts-node globally or use npx

   ```bash
   npx ts-node scripts/ingestWeather.ts
   ```

3. **MongoDB Connection**: Check connection string and network access

4. **Open-Meteo API**: Verify API is accessible and returning data

### Testing the Setup

```bash
# Manual test run
npx ts-node scripts/ingestWeather.ts

# Check database
mongosh --eval "db.weather.countDocuments()"

# Verify data structure
mongosh --eval "db.weather.findOne()"
```
