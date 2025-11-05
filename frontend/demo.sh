#!/bin/bash

echo "🎯 Social Media Search Frontend Demo"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory"
    echo "   cd frontend"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🚀 Starting development server..."
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Home: http://localhost:3000"
echo "   Search Notes: http://localhost:3000/search/notes"
echo "   Search Users: http://localhost:3000/search/users"
echo ""
echo "💡 Features to try:"
echo "   • Navigate between notes and users search"
echo "   • Try different search terms like 'travel', 'food', 'tech'"
echo "   • Apply filters for different platforms"
echo "   • Test pagination controls"
echo "   • Try responsive design (resize browser)"
echo ""
echo "🔧 Note: The frontend will use mock data since the backend"
echo "   search endpoints are not yet implemented."
echo ""

# Start the development server
npm run dev