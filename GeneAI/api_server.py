#!/usr/bin/env python3
"""
AI聊天后端API服务器
提供与前端对接的REST API接口
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import time
from datetime import datetime

# 加载环境变量
load_dotenv()

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 初始化 OpenAI 客户端
api_key = os.getenv("OPENAI_API_KEY")
base_url = "https://api.chatanywhere.tech"

if not api_key:
    print("警告: 未找到 OPENAI_API_KEY 环境变量")

client = OpenAI(
    api_key=api_key,
    base_url=base_url
)

# 临时存储会话数据（生产环境应使用数据库）
sessions = {}

def build_system_prompt(user_info=None, analysis=None):
    """构建系统提示词"""
    prompt = """你是一位专门为盲人群体提供心理辅导的AI伙伴。你的名字是小暖，是一位温暖、理解、专业的心理辅导助手。

**你的核心职责：**
1. 倾听和理解：认真倾听用户的每一个想法和感受，给予充分的理解和共情
2. 心理疏导：根据用户的心理状态，提供温和、专业的心理疏导建议
3. 情感支持：用温暖的话语陪伴用户，让他们感受到被理解和支持
4. 积极引导：帮助用户建立积极的心态，增强自信心和适应能力

"""
    
    if user_info:
        if user_info.get("name"):
            prompt += f"用户姓名：{user_info['name']}。\n"
        if user_info.get("visionType"):
            prompt += f"视力类型：{user_info['visionType']}。\n"
    
    if analysis:
        prompt += "\n**心理分析结果（内部参考，不要直接告诉用户）：**\n"
        prompt += f"- 情绪状态：{analysis.get('emotionalState', '未知')}\n"
        prompt += f"- 风险等级：{analysis.get('riskLevel', '低')}\n"
        prompt += f"- 建议疏导方向：{analysis.get('suggestedApproach', '继续倾听和陪伴')}\n"
    
    prompt += """
**回复原则：**
1. 使用温暖、理解、支持性的语言，避免说教和命令式语气
2. 根据心理分析结果，自然地融入疏导内容，但不要直接提及"心理分析"或"心理问题"
3. 如果风险等级为"高"，要特别关注，建议寻求专业帮助，但语气要温和
4. 如果用户表达负面情绪，先给予共情和理解，再提供建设性的建议
5. 鼓励用户表达感受，让他们知道有人理解他们
6. 使用盲人友好的表达方式，避免过多视觉相关的比喻
7. 保持对话的自然流畅，不要显得过于机械化

**重要提醒：**
- 你是在进行心理疏导，不是诊断或治疗
- 如果用户有严重的心理危机（如自伤、自杀倾向），要温和地建议寻求专业心理医生帮助
- 保持专业边界，不要过度承诺或给出医疗建议

现在，请根据用户的对话内容，用温暖、理解的方式回复用户。"""
    
    return prompt

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])  # 同时支持 /api/health 路径
def health():
    """健康检查接口"""
    return jsonify({
        "status": "ok",
        "message": "服务运行正常",
        "timestamp": int(time.time() * 1000)
    })

@app.route('/api/ai/chat/sessions', methods=['POST'])
def create_session():
    """创建聊天会话"""
    try:
        data = request.get_json() or {}
        title = data.get('title', '新对话')
        session_id = f"session_{int(time.time() * 1000)}"
        
        # 创建新会话
        sessions[session_id] = {
            'sessionId': session_id,
            'title': title,
            'messages': [],
            'userInfo': None,
            'createdAt': datetime.now().isoformat()
        }
        
        return jsonify({
            "code": 200,
            "message": "创建成功",
            "data": {
                "sessionId": session_id,
                "title": title
            }
        })
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": f"创建会话失败: {str(e)}"
        }), 500

@app.route('/api/ai/chat/messages', methods=['POST'])
def send_message():
    """发送消息并获取AI回复"""
    global client, api_key, base_url
    try:
        # 记录请求信息（调试用）
        auth_header = request.headers.get('Authorization', '')
        print(f"[DEBUG] 收到请求，Authorization: {auth_header[:20]}..." if auth_header else "[DEBUG] 收到请求，无Authorization头")
        
        data = request.get_json()
        if not data:
            return jsonify({
                "code": 400,
                "message": "请求参数不能为空"
            }), 400
        
        session_id = data.get('sessionId')
        message = data.get('message')
        
        print(f"[DEBUG] 请求参数 - sessionId: {session_id}, message: {message[:50] if message else 'None'}...")
        
        if not message:
            return jsonify({
                "code": 400,
                "message": "消息内容不能为空"
            }), 400
        
        # 如果没有sessionId，创建一个新会话
        if not session_id:
            session_id = f"session_{int(time.time() * 1000)}"
            sessions[session_id] = {
                'sessionId': session_id,
                'title': '新对话',
                'messages': [],
                'userInfo': None,
                'createdAt': datetime.now().isoformat()
            }
        
        # 获取或创建会话
        session = sessions.get(session_id)
        if not session:
            session = {
                'sessionId': session_id,
                'title': '新对话',
                'messages': [],
                'userInfo': None,
                'createdAt': datetime.now().isoformat()
            }
            sessions[session_id] = session
        
        # 添加用户消息
        session['messages'].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # 构建消息列表
        messages = []
        
        # 添加系统提示词
        system_prompt = build_system_prompt(
            user_info=session.get('userInfo'),
            analysis=None  # 简化版本，不进行心理分析
        )
        messages.append({
            'role': 'system',
            'content': system_prompt
        })
        
        # 添加对话历史（最近10条）
        history = session['messages'][-10:]
        for msg in history:
            messages.append({
                'role': msg['role'],
                'content': msg['content']
            })
        
        # 调用 OpenAI API
        # 每次请求时重新读取 API Key（防止 Flask 重载导致环境变量丢失）
        # 优先从环境变量读取，如果没有则从模块变量读取
        load_dotenv()  # 重新加载 .env 文件
        current_api_key = os.getenv("OPENAI_API_KEY") or api_key
        if not current_api_key:
            print(f"[ERROR] API Key 未配置，无法调用 OpenAI API")
            print(f"[ERROR] 环境变量 OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY')}")
            print(f"[ERROR] 模块变量 api_key: {api_key[:20] + '...' if api_key else 'None'}")
            return jsonify({
                "code": 500,
                "message": "AI服务暂不可用。请确保已配置 OPENAI_API_KEY 环境变量。",
                "data": None
            }), 500
        
        print(f"[DEBUG] 当前 API Key: {current_api_key[:20] + '...' if current_api_key else 'None'}")
        
        try:
            # 如果 API Key 变化了，重新创建客户端
            if current_api_key != api_key:
                client = OpenAI(api_key=current_api_key, base_url=base_url)
                api_key = current_api_key
            
            print(f"[DEBUG] 准备调用OpenAI API，API Key存在: {bool(current_api_key)}, Base URL: {base_url}")
            print(f"[DEBUG] 消息数量: {len(messages)}, 第一条消息角色: {messages[0]['role'] if messages else 'N/A'}")
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7
            )
            
            ai_response = response.choices[0].message.content
            print(f"[DEBUG] OpenAI API调用成功，回复长度: {len(ai_response) if ai_response else 0}")
            
            # 添加AI回复到历史
            session['messages'].append({
                'role': 'assistant',
                'content': ai_response,
                'timestamp': datetime.now().isoformat()
            })
            
            return jsonify({
                "code": 200,
                "message": "发送成功",
                "data": {
                    "sessionId": session_id,
                    "userMessage": message,
                    "aiResponse": ai_response,
                    "createdAt": datetime.now().isoformat()
                }
            })
        except Exception as e:
            error_msg = str(e)
            error_type = type(e).__name__
            print(f"[ERROR] OpenAI API调用失败: {error_type}: {error_msg}")
            print(f"[ERROR] API Key存在: {bool(current_api_key)}, Base URL: {base_url}")
            print(f"[ERROR] 环境变量 OPENAI_API_KEY: {os.getenv('OPENAI_API_KEY')[:20] + '...' if os.getenv('OPENAI_API_KEY') else 'None'}")
            
            if "401" in error_msg or "Unauthorized" in error_msg or "Invalid API Key" in error_msg:
                print(f"[ERROR] 检测到401/Unauthorized错误，返回API Key配置错误提示")
                # 确保返回正确的HTTP状态码和响应格式
                return jsonify({
                    "code": 500,
                    "message": "AI服务暂不可用。请确保已配置 OPENAI_API_KEY 环境变量。",
                    "data": None
                }), 500
            else:
                print(f"[ERROR] 其他错误，返回详细错误信息")
                return jsonify({
                    "code": 500,
                    "message": f"AI回复失败: {error_msg}",
                    "data": None
                }), 500
        
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": f"发送失败: {str(e)}"
        }), 500

@app.route('/api/ai/chat/user-info', methods=['POST'])
def save_user_info():
    """保存用户信息"""
    try:
        data = request.get_json() or {}
        session_id = data.get('sessionId', 'default')
        
        # 获取或创建会话
        if session_id not in sessions:
            sessions[session_id] = {
                'sessionId': session_id,
                'title': '新对话',
                'messages': [],
                'userInfo': None,
                'createdAt': datetime.now().isoformat()
            }
        
        sessions[session_id]['userInfo'] = data
        
        return jsonify({
            "code": 200,
            "message": "保存成功"
        })
    except Exception as e:
        return jsonify({
            "code": 500,
            "message": f"保存失败: {str(e)}"
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 3000))
    print(f"启动AI聊天API服务器，端口: {port}")
    print(f"API Key已配置: {bool(api_key)}")
    print(f"Base URL: {base_url}")
    app.run(host='0.0.0.0', port=port, debug=True)





