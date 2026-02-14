#!/bin/bash
# Java后端快速安装脚本

echo "=========================================="
echo "Java后端环境配置脚本"
echo "=========================================="
echo ""

# 检查是否安装了Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew未安装"
    echo ""
    echo "正在安装Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # 配置Homebrew到PATH（针对Apple Silicon Mac）
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "✅ Homebrew已安装"
fi

echo ""
echo "=========================================="
echo "检查Java版本"
echo "=========================================="

# 检查Java版本
JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | sed '/^1\./s///' | cut -d'.' -f1)

if [ -z "$JAVA_VERSION" ] || [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Java版本过低（当前：Java $JAVA_VERSION），需要Java 17+"
    echo ""
    echo "正在安装Java 17..."
    brew install openjdk@17
    
    # 配置Java环境变量
    echo ""
    echo "配置Java环境变量..."
    if [ -f "/opt/homebrew/opt/openjdk@17/bin/java" ]; then
        export JAVA_HOME=/opt/homebrew/opt/openjdk@17
        export PATH=$JAVA_HOME/bin:$PATH
        echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17' >> ~/.zshrc
        echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
    else
        # 尝试查找Java 17
        JAVA_17_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null)
        if [ -n "$JAVA_17_HOME" ]; then
            export JAVA_HOME=$JAVA_17_HOME
            export PATH=$JAVA_HOME/bin:$PATH
            echo "export JAVA_HOME=$JAVA_17_HOME" >> ~/.zshrc
            echo 'export PATH=$JAVA_HOME/bin:$PATH' >> ~/.zshrc
        fi
    fi
    
    echo "✅ Java 17安装完成"
    echo ""
    echo "⚠️  请重新打开终端或运行以下命令使配置生效："
    echo "   source ~/.zshrc"
    echo ""
else
    echo "✅ Java版本符合要求（Java $JAVA_VERSION）"
fi

echo ""
echo "=========================================="
echo "检查Maven"
echo "=========================================="

# 检查Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven未安装"
    echo ""
    echo "正在安装Maven..."
    brew install maven
    echo "✅ Maven安装完成"
else
    echo "✅ Maven已安装"
    mvn -version
fi

echo ""
echo "=========================================="
echo "验证安装"
echo "=========================================="

# 验证Java
echo "Java版本："
java -version 2>&1 | head -1

# 验证Maven
echo ""
echo "Maven版本："
if command -v mvn &> /dev/null; then
    mvn -version | head -1
else
    echo "❌ Maven未找到，请检查安装"
fi

echo ""
echo "=========================================="
echo "安装完成！"
echo "=========================================="
echo ""
echo "下一步："
echo "1. 如果Java版本已更新，请重新打开终端"
echo "2. 配置OpenAI API Key："
echo "   export OPENAI_API_KEY=your_api_key_here"
echo "3. 启动后端："
echo "   cd GeneAI-Java"
echo "   mvn spring-boot:run"
echo ""

