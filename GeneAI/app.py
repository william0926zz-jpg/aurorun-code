import os
os.environ["STREAMLIT_SERVER_HEADLESS"] = "true"

from openai import OpenAI
from dotenv import load_dotenv
import streamlit as st
import csv

load_dotenv()       
client = OpenAI(
    base_url="https://api.chatanywhere.tech"
)

# Initial session state
if "messages" not in st.session_state:
    st.session_state["messages"] = []

if "user_info" not in st.session_state:
    st.session_state["user_info"] = {}


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

    # Build system prompt from saved user metadata
    user_info = st.session_state["user_info"]

    # Build prompt based on user input
    system_prompt = f"""
         You are a friendly healthcare assistant.
    """

    # Get bot response
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": system_prompt}] +
                 st.session_state["messages"]
    )

    bot_reply = response.choices[0].message.content

    st.session_state["messages"].append({"role": "assistant", "content": bot_reply})

    with st.chat_message("assistant"):
        st.write(bot_reply)

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