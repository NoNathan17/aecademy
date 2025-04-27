#!/bin/bash

echo "Activating virtual environment..."

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
  echo "🛠 venv not found. Creating virtual environment..."
  # Try python3 first, fallback to python
  if command -v python3 &> /dev/null; then
      python3 -m venv venv
  elif command -v python &> /dev/null; then
      python -m venv venv
  else
      echo "Python is not installed."
      exit 1
  fi
fi

# Activate virtual environment
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    # Linux or MacOS
    source venv/bin/activate
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash or WSL)
    source venv/Scripts/activate
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Choose python3 or python dynamically
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "Starting Backend API Server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
sleep 2

echo "Starting Content Parser Agent..."
$PYTHON_CMD app/agents/content_parser.py &
sleep 2

echo "Starting Quiz Maker Agent..."
$PYTHON_CMD app/agents/quiz.py &
sleep 2

echo "Starting Database..."
$PYTHON_CMD app/database.py &
sleep 2

echo "All backend services started!"
