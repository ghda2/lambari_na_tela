#!/bin/bash

# AI Video Processor Cron Job
# This script should be run periodically (e.g., every hour) via cron

# Set the working directory to the project root
cd "$(dirname "$0")"

# Run the AI processor (no env file needed, everything is hardcoded)
echo "$(date): Starting AI video processing..."
python ai_processor.py
echo "$(date): AI video processing completed."

# Optional: Log to a file
# echo "$(date): AI processing completed" >> ai_processor.log