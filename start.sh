#!/bin/bash

echo "正在启动视频链接解析API..."

if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

echo "激活虚拟环境..."
source venv/bin/activate

echo "安装依赖..."
pip install -r requirements.txt -q

echo "启动服务..."
echo "API文档: http://localhost:8000/docs"
echo "按 Ctrl+C 停止服务"
echo ""

python main.py
