#!/bin/bash

# Social Media Parser - Development Helper Script

echo "🚀 Social Media Parser Development Helper"
echo "=========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "📋 Checking dependencies..."

# Check Python
if command_exists python3; then
    echo "✅ Python3 found"
else
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Check Node.js
if command_exists node; then
    echo "✅ Node.js found"
else
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command_exists npm; then
    echo "✅ npm found"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo ""
echo "🔧 Available commands:"
echo "1) Start backend server"
echo "2) Install backend dependencies"
echo "3) Start frontend server"
echo "4) Install frontend dependencies"
echo "5) Install all dependencies"
echo "6) Start both servers (development)"
echo "7) Run backend tests"
echo "8) Run frontend tests"
echo "9) Build frontend for production"
echo "0) Exit"

read -p "Choose an option (0-9): " choice

case $choice in
    1)
        echo "🔥 Starting backend server..."
        python3 main.py
        ;;
    2)
        echo "📦 Installing backend dependencies..."
        pip3 install -r requirements.txt
        ;;
    3)
        echo "🎨 Starting frontend server..."
        cd frontend && npm run dev
        ;;
    4)
        echo "📦 Installing frontend dependencies..."
        cd frontend && npm install
        ;;
    5)
        echo "📦 Installing all dependencies..."
        pip3 install -r requirements.txt
        cd frontend && npm install
        cd ..
        ;;
    6)
        echo "🚀 Starting both servers for development..."
        echo "Backend will run on http://localhost:8000"
        echo "Frontend will run on http://localhost:3000"
        echo ""
        echo "Press Ctrl+C to stop both servers"
        
        # Start backend in background
        python3 main.py &
        BACKEND_PID=$!
        
        # Wait a moment for backend to start
        sleep 2
        
        # Start frontend
        cd frontend && npm run dev
        FRONTEND_PID=$!
        
        # Wait for user to stop
        wait
        
        # Clean up background processes
        kill $BACKEND_PID 2>/dev/null
        ;;
    7)
        echo "🧪 Running backend tests..."
        python3 -m pytest tests/ -v
        ;;
    8)
        echo "🧪 Running frontend tests..."
        cd frontend && npm test
        ;;
    9)
        echo "🏗️ Building frontend for production..."
        cd frontend && npm run build
        ;;
    0)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid option. Please choose 0-9."
        exit 1
        ;;
esac

echo ""
echo "✅ Command completed!"