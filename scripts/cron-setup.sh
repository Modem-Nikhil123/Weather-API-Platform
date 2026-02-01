#!/bin/bash

# Absolute project path
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

SCRIPT_PATH="$PROJECT_DIR/scripts/ingestWeather.ts"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/weather-ingestion.log"

mkdir -p "$LOG_DIR"

CRON_COMMAND="*/1 * * * * cd $PROJECT_DIR && npx tsx $SCRIPT_PATH >> $LOG_FILE 2>&1"

# Remove existing ingestion cron if exists
crontab -l 2>/dev/null | grep -v "ingestWeather.ts" | crontab -

# Add new cron
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

echo "✅ Weather ingestion cron installed"
echo "⏱ Runs every 10 minutes"
echo "📄 Logs: $LOG_FILE"
