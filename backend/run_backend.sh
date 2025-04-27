echo "Activating virtual environment..."
# Check if running on Mac/Linux or Windows
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
    # Linux or MacOS
    source venv/bin/activate
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash or WSL)
    source venv/Scripts/activate
else
    echo "❌ Unsupported OS: $OSTYPE"
    exit 1
fi

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Starting Backend API Server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
sleep 2

echo "Starting Content Parser Agent..."
python3 app/agents/content_parser.py &
sleep 2

echo "Starting Quiz Maker Agent..."
python3 app/agents/quiz.py &
sleep 2

echo "✅ All backend services started!"