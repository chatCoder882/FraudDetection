#!/bin/bash

# Sentinel — Start both Backend and Frontend servers

echo "==========================================================="
echo "🛡️ Starting Sentinel Agentic Fraud Investigation Console 🛡️"
echo "==========================================================="

# Navigate to the workspace root
cd "$(dirname "$0")" || exit

# 1. Start the FastAPI Backend
echo ""
echo "🚀 Starting FastAPI Backend (Port 8000)..."
if [ ! -d "venv" ]; then
    echo "⚠️  Virtual environment not found! Please run setup first."
    exit 1
fi

# Activate venv and start uvicorn in the background
source venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend running with PID: $BACKEND_PID"

# Wait for the backend to become ready before starting the frontend.
for attempt in {1..10}; do
    if curl --silent --fail --output /dev/null http://127.0.0.1:8000/docs; then
        break
    fi
    if [ "$attempt" -eq 10 ]; then
        echo "❌ Backend failed to start. Check the Uvicorn output above."
        kill "$BACKEND_PID" 2>/dev/null || true
        exit 1
    fi
    sleep 1
done

# 2. Start the React Frontend
echo ""
echo "🎨 Starting Lovable React Frontend..."
cd UI/newui || exit

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start npm dev server in the background
npm run dev &
FRONTEND_PID=$!
echo "Frontend running with PID: $FRONTEND_PID"

echo ""
echo "==========================================================="
echo "✅ All systems operational!"
echo "➡️  Backend API: http://localhost:8000/docs"
echo "➡️  Frontend UI: See the Vite URL printed below"
echo "==========================================================="
echo "Press Ctrl+C to stop all servers."

# Trap Ctrl+C to kill both background processes
trap "echo -e '\n🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM

# Keep the script running to hold the trap
wait
