from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()       
client = OpenAI(
    base_url="https://api.chatanywhere.tech"
)  

def simple_bot():   
    while True:     
        user_input = input("You: ")    

        response = client.chat.completions.create(       
            model="gpt-3.5-turbo",                       
            messages=[                                  
                {"role": "system", "content": "You are a helpful chatbot."},
                {"role": "user", "content": user_input}
            ]
        )
        print("Bot:", response.choices[0].message.content)      

#simple_bot()

def chatbot_with_memory():
    messages = [
        {"role": "system", "content": "You are a helpful chatbot."}
    ]

    while True:
        user_input = input("You: ")
        messages.append({"role": "user", "content": user_input})

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )

        print("Bot:", response.choices[0].message.content)

        messages.append({"role": "assistant", "content": response.choices[0].message.content})
chatbot_with_memory()

import json
import os

HISTORY_FILE = "chat_history.json"


def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    else:
        return [{"role": "system", "content": "You are a persistent memory chatbot."}]