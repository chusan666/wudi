#!/bin/bash

# KOL Dashboard Development Start Script

echo "🚀 Starting KOL Dashboard Development Environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Start backend
echo "📦 Starting backend server..."
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment and install dependencies
echo "📚 Installing backend dependencies..."
source venv/bin/activate
pip install -r requirements.txt

# Start backend in background
echo "🎯 Starting FastAPI server on http://localhost:8000..."
python main.py &
BACKEND_PID=$!

# Start frontend
echo "🎨 Starting frontend development server..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📚 Installing frontend dependencies..."
    npm install
fi

# Start frontend
echo "🚀 Starting Next.js server on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

# Wait for user input to stop
echo "✅ Both servers are running!"
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set up trap for cleanup
trap cleanup INT TERM

# Wait for processes
wait