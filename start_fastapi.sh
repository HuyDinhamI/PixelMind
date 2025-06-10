#!/bin/bash

echo "Starting PixelMind FastAPI Backend..."

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create it with your API keys."
    echo "Required keys: GEMINI_API_KEY, LEONARDO_API_KEY"
fi

# Start FastAPI server
echo "Starting FastAPI server..."
uvicorn app:app --reload --host 0.0.0.0 --port 5000
