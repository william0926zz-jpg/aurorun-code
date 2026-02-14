#!/bin/bash
# Java 17 自动安装脚本
# 使用方法：在终端运行：bash GeneAI-Java/install-java17.sh

set -e

echo "========================================="
echo "Java 17 安装脚本"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否已安装 Java 17
check_java17() {
    if /usr/libexec/java_home -V 2>&1 | grep -q "17"; then
        JAVA17_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || echo "")
        if [ -n "$JAVA17_HOME" ]; then
            echo -e "${GREEN}✓ Java 17 已安装: $JAVA17_HOME${NC}"
            return 0
        fi
    fi
    return 1
}

# 检查并安装 Homebrew
install_homebrew() {
    if command -v brew &> /dev/null; then
        echo -e "${GREEN}✓ Homebrew 已安装${NC}"
        # 确保 Homebrew 在 PATH 中
        if [[ "$PATH" != *"/opt/homebrew/bin"* ]] && [[ "$PATH" != *"/usr/local/bin"* ]]; then
            if [ -f "/opt/homebrew/bin/brew" ]; then
                eval "$(/opt/homebrew/bin/brew shellenv)"
            elif [ -f "/usr/local/bin/brew" ]; then
                eval "$(/usr/local/bin/brew shellenv)"
            fi
        fi
        return 0
    fi
    
    echo -e "${YELLOW}正在安装 Homebrew...${NC}"
    echo "注意：此过程需要您的管理员密码"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # 配置 Homebrew 到 PATH
    if [ -f "/opt/homebrew/bin/brew" ]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/opt/homebrew/bin/brew shellenv)"
        echo -e "${GREEN}✓ Homebrew 已安装并配置（Apple Silicon）${NC}"
    elif [ -f "/usr/local/bin/brew" ]; then
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
        eval "$(/usr/local/bin/brew shellenv)"
        echo -e "${GREEN}✓ Homebrew 已安装并配置（Intel）${NC}"
    fi
}

# 安装 Java 17
install_java17() {
    echo -e "${YELLOW}正在安装 Java 17...${NC}"
    brew install openjdk@17
    
    # 创建符号链接（如果需要）
    if [ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk" ]; then
        sudo mkdir -p /Library/Java/JavaVirtualMachines 2>/dev/null || true
        sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk 2>/dev/null || true
    elif [ -d "/usr/local/opt/openjdk@17/libexec/openjdk.jdk" ]; then
        sudo mkdir -p /Library/Java/JavaVirtualMachines 2>/dev/null || true
        sudo ln -sfn /usr/local/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✓ Java 17 已安装${NC}"
}

# 配置环境变量
setup_env() {
    echo -e "${YELLOW}正在配置环境变量...${NC}"
    
    # 检查是否已经配置过
    if grep -q "JAVA_HOME.*java_home.*17" ~/.zshrc 2>/dev/null; then
        echo -e "${GREEN}✓ 环境变量已配置${NC}"
        return 0
    fi
    
    # 添加到 .zshrc
    {
        echo ""
        echo "# Java 17 Configuration"
        echo "export JAVA_HOME=\$(/usr/libexec/java_home -v 17 2>/dev/null || echo \"\")"
        echo "if [ -n \"\$JAVA_HOME\" ]; then"
        echo "    export PATH=\$JAVA_HOME/bin:\$PATH"
        echo "fi"
    } >> ~/.zshrc
    
    # 立即生效
    export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || echo "")
    if [ -n "$JAVA_HOME" ]; then
        export PATH=$JAVA_HOME/bin:$PATH
    fi
    
    echo -e "${GREEN}✓ 环境变量已配置${NC}"
}

# 主流程
main() {
    echo ""
    
    # 1. 检查是否已安装 Java 17
    if check_java17; then
        echo -e "${GREEN}Java 17 已安装，跳过安装步骤${NC}"
        setup_env
        echo ""
        echo -e "${GREEN}=========================================${NC}"
        echo -e "${GREEN}安装完成！${NC}"
        echo -e "${GREEN}=========================================${NC}"
        java -version
        echo ""
        echo "请运行以下命令使配置生效："
        echo "  source ~/.zshrc"
        exit 0
    fi
    
    # 2. 检查并安装 Homebrew
    install_homebrew
    
    # 3. 安装 Java 17
    install_java17
    
    # 4. 配置环境变量
    setup_env
    
    echo ""
    echo -e "${GREEN}=========================================${NC}"
    echo -e "${GREEN}安装完成！${NC}"
    echo -e "${GREEN}=========================================${NC}"
    echo ""
    echo "验证安装："
    java -version
    echo ""
    echo "如果版本不正确，请运行："
    echo "  source ~/.zshrc"
    echo "  java -version"
}

# 运行主流程
main


