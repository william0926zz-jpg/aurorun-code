#!/bin/bash
# 重启后端服务脚本

cd "$(dirname "$0")"

echo "正在停止旧的后端服务..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "没有正在运行的服务"

sleep 2

echo "正在启动后端服务..."
mvn spring-boot:run


