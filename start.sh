#!/bin/bash

echo "🚀 启动社交媒体视频解析分析工具"
echo ""

echo "📦 检查后端依赖..."
cd backend
if [ ! -d "venv" ]; then
    echo "创建Python虚拟环境..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt -q

echo "✅ 后端依赖已安装"
echo ""

echo "🔧 启动后端服务..."
python app.py &
BACKEND_PID=$!
cd ..

echo "📦 检查前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

echo "✅ 前端依赖已安装"
echo ""

echo "🎨 启动前端服务..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务已启动！"
echo "📡 后端: http://localhost:5000"
echo "🌐 前端: http://localhost:5173"
echo ""
echo "按 Ctrl+C 停止服务"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
