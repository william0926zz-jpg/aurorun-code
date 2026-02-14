#!/bin/bash
# 启动AI聊天API服务器

cd "$(dirname "$0")"

echo "正在启动AI聊天API服务器..."
echo "端口: 3000"
echo ""

# 检查是否已安装依赖
if ! python3 -c "import flask" 2>/dev/null; then
    echo "正在安装依赖..."
    pip3 install flask flask-cors --quiet
fi

# 检查环境变量
if [ -z "$OPENAI_API_KEY" ]; then
    echo "警告: 未找到 OPENAI_API_KEY 环境变量"
    echo "请先设置环境变量:"
    echo "  export OPENAI_API_KEY=your_api_key_here"
    echo ""
fi

# 启动服务
python3 api_server.py













