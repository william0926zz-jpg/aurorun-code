import os
os.environ["STREAMLIT_SERVER_HEADLESS"] = "true"

from dotenv import load_dotenv
import streamlit as st
import csv
import requests
import uuid
from typing import Optional, Dict, Any

load_dotenv()       

# === 配置：改为调用你项目的 AI 聊天后端（与 uni-app 前端同一套接口）===
# 说明：
# - 后端需要登录态（Bearer Token），否则会 401
# - 会话创建：POST /api/ai/chat/sessions  -> { data: { sessionId } }
# - 发送消息：POST /api/ai/chat/messages -> { data: { aiResponse, sessionId } }
DEFAULT_BACKEND_URL = os.getenv("GENEAI_BACKEND_URL", "https://fwthugojqdue.sealosbja.site")

def _headers(token: str) -> Dict[str, str]:
    h = {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Request-Id": f"geneai_{uuid.uuid4().hex}",
    }
    if token:
        h["Authorization"] = f"Bearer {token}"
    return h

def health_check(base_url: str, token: str) -> Optional[Dict[str, Any]]:
    try:
        r = requests.get(f"{base_url}/api/health", headers=_headers(token), timeout=10)
        return {"status_code": r.status_code, "data": r.json() if r.content else None}
    except Exception as e:
        return {"error": str(e)}

def create_session(base_url: str, token: str, title: str = "新对话") -> str:
    r = requests.post(
        f"{base_url}/api/ai/chat/sessions",
        json={"title": title},
        headers=_headers(token),
        timeout=20,
    )
    r.raise_for_status()
    payload = r.json() if r.content else {}
    if payload.get("code") != 200 or not payload.get("data") or not payload["data"].get("sessionId"):
        raise RuntimeError(f"创建会话失败：{payload}")
    return payload["data"]["sessionId"]

def send_message(base_url: str, token: str, session_id: str, message: str) -> Dict[str, Any]:
    r = requests.post(
        f"{base_url}/api/ai/chat/messages",
        json={"sessionId": session_id, "message": message},
        headers=_headers(token),
        timeout=60,
    )
    r.raise_for_status()
    payload = r.json() if r.content else {}
    return payload

# Initial session state
if "messages" not in st.session_state:
    st.session_state["messages"] = []

if "user_info" not in st.session_state:
    st.session_state["user_info"] = {}

if "session_id" not in st.session_state:
    st.session_state["session_id"] = None

# Sidebar: backend/token config
st.sidebar.header("Backend Config")
backend_url = st.sidebar.text_input("Backend URL", value=DEFAULT_BACKEND_URL)
token = st.sidebar.text_input("Authorization Token (Bearer)", value=os.getenv("GENEAI_TOKEN", ""), type="password")

with st.sidebar.expander("连接测试（调试）", expanded=False):
    if st.button("测试 /api/health"):
        st.write(health_check(backend_url, token))
    if st.button("新建会话"):
        try:
            st.session_state["session_id"] = create_session(backend_url, token)
            st.success(f"sessionId: {st.session_state['session_id']}")
        except Exception as e:
            st.error(f"创建会话失败：{e}")
    if st.button("清空对话"):
        st.session_state["messages"] = []
        st.session_state["session_id"] = None
        st.success("已清空")

# Module 1: Main chatbot page
st.set_page_config(page_title="Healthcare Chatbot", layout="wide")
st.title("Healthcare Assistant Chatbot")

# Display all existing messages so far
for msg in st.session_state["messages"]:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# Get user's message
user_input = st.chat_input("Ask me anything")

if user_input:
    st.session_state["messages"].append({"role": "user", "content": user_input})

    # Display user's message
    with st.chat_message("user"):
        st.write(user_input)

    # 调用你项目的 AI 聊天后端
    try:
        if not st.session_state["session_id"]:
            st.session_state["session_id"] = create_session(backend_url, token)

        payload = send_message(backend_url, token, st.session_state["session_id"], user_input)

        # 兼容后端字段差异：优先 aiResponse，其次 message/response/text
        data = payload.get("data") or {}
        bot_reply = (
            data.get("aiResponse")
            or data.get("response")
            or data.get("text")
            or data.get("content")
            or payload.get("message")
            or ""
        )

        if payload.get("code") != 200 or not bot_reply:
            raise RuntimeError(f"后端返回非成功或无回复：{payload}")

        # 后端可能返回新的 sessionId（可选）
        if data.get("sessionId"):
            st.session_state["session_id"] = data["sessionId"]

        st.session_state["messages"].append({"role": "assistant", "content": bot_reply})
        with st.chat_message("assistant"):
            st.write(bot_reply)
    except requests.HTTPError as e:
        # 展示后端原始错误，便于你定位是否仍命中旧版本
        detail = ""
        try:
            detail = e.response.text
        except Exception:
            detail = str(e)
        st.error(f"HTTP错误：{e}\n\n响应：{detail}")
    except Exception as e:
        st.error(f"发送失败：{e}")

# Module 2: Info input
st.sidebar.header("Daily Health Check-In")
with st.sidebar.form("user_form"):
    name = st.text_input("Name")
    age = st.number_input("Age", min_value=1, max_value=120)
    symptom = st.text_input("Today's main symptom")
    mood = st.slider("Mood (1 = bad, 10 = great)", 1, 10)

    submitted = st.form_submit_button("Save Info")

if submitted:
    st.session_state["user_info"] = {
        "name": name,
        "age": age,
        "symptom": symptom,
        "mood": mood
    }
    st.sidebar.success("Saved!")

    # Save to CSV
    with open("user_data.csv", "a", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([name, age, symptom, mood])