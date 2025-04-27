echo "Installing dependencies..."
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
