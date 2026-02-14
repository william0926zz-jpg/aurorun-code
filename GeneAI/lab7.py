### EXERCISE 1 ###
def exercise_1():
    user_input = input("Ask the chatbot a question: ").lower()

    if "forbidden_topic" in user_input:
        print("I can't help with that topic.")
    else:
        print("Here is a mock safe response to your question.")

### END OF EXERCISE 1 ###




### EXERCISE 2 ###
def exercise_2():
    user_input = input("Ask the chatbot a question: ").lower()

    if "forbidden_topic" in user_input:
        print("I can't help with that topic.")

    elif "related_word" in user_input or "another_related_word" in user_input:
        print("That question might be about a restricted topic.")

    else:
        print("Here is a mock safe response.")

### END OF EXERCISE 2 ###





### EXERCISE 3 ###
def exercise_3():
    response = input("AI draft response: ").lower()

    if "you should" in response:
        print("Response blocked: sounds like advice.")
    else:
        print("Response approved.")

### END OF EXERCISE 3 ###





### EXERCISE 4 OPTION A ###
def exercise_4a():
    user_input = input("User: ").strip()
    text = user_input.lower()

    # Start with a baseline confidence
    confidence = 0.50

    # More detail -> more confidence
    if len(text) >= 80:
        confidence += 0.15
    elif len(text) <= 20:
        confidence -= 0.15

    # Question marks can indicate a clear question
    if "?" in text:
        confidence += 0.05

    # Vague words -> lower confidence
    if "something" in text or "stuff" in text or "idk" in text or "not sure" in text:
        confidence -= 0.20

    # "Advice-y" wording -> lower confidence (safer to refuse)
    if "what should i do" in text or "should i" in text or "tell me what to do" in text:
        confidence -= 0.25

    # Clamp confidence to [0, 1]
    if confidence < 0:
        confidence = 0.0
    if confidence > 1:
        confidence = 1.0

    print(f"[debug] confidence={confidence:.2f}")

    THRESHOLD = 0.65

    if confidence < THRESHOLD:
        print("Bot: I'm not confident I can answer that safely. Can you add more details or ask in a more general way?")
    else:
        print("Bot: Here's a mock general, educational answer (not advice).")

### END OF EXERCISE 4 OPTION A ###








### EXERCISE 4 OPTION B ###

def exercise_4b():
    from sklearn.feature_extraction.text import CountVectorizer
    from sklearn.linear_model import LogisticRegression

    # Toy training data: label 1 = safe-to-answer, label 0 = refuse/escalate
    texts = [
        "What is a fever?",
        "Explain how vaccines work.",
        "What does dehydration mean?",
        "How does the immune system respond to infection?",

        "Tell me what I should do right now about my symptoms",
        "Should I take more of my medication?",
        "I have chest pain what should I do",
        "Give me a diagnosis based on these symptoms"
    ]
    labels = [1, 1, 1, 1, 0, 0, 0, 0]

    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(texts)

    model = LogisticRegression()
    model.fit(X, labels)

    # --- Inference ---
    user_input = input("User: ")
    x_new = vectorizer.transform([user_input])

    # Probability of class 1 ("safe-to-answer")
    p_safe = model.predict_proba(x_new)[0][1]

    print(f"[debug] p_safe={p_safe:.2f}")

    THRESHOLD = 0.70

    if p_safe < THRESHOLD:
        print("Bot: I can't answer that directly. I can provide general info or suggest getting help from a professional.")
    else:
        print("Bot: Here's a mock general educational information (not personalized advice).")

### END OF EXERCISE 4 OPTION B ###




### EXERCISE 5 ###
def exercise_5():
    from openai import OpenAI
    from dotenv import load_dotenv

    load_dotenv()       
    client = OpenAI()   

    # SYSTEM_RULES = """
    # You are a health education chatbot.
    # - Give general educational info only.
    # - Do not provide diagnosis or treatment instructions.
    # - If user asks for personal medical advice, refuse and suggest seeing a professional.
    # - If uncertain, say so.
    # """

    SYSTEM_RULES = """
    You are a helpful assistant.

    Safety Rule:
    - You must not talk about forbidden_topic.
    - If the user asks directly about forbidden_topic, politely refuse.

    Refusal Style:
    - Be calm and respectful.
    - State that you cannot help with that topic.
    - Offer to help with a different subject.

    If the user request does not involve forbidden_topic, respond normally.

    """
     
    user_input = input("You: ") 

    response = client.chat.completions.create(       
        model="gpt-3.5-turbo",                       
        messages=[                                  
            {"role": "system", "content": SYSTEM_RULES},
            {"role": "user", "content": user_input}
        ]
    )

    print(response.choices[0].message.content)

### END OF EXERCISE 5 ###


if __name__ == "__main__":
    # exercise_1()
    # exercise_2()
    # exercise_3()
    # exercise_4a()
    # exercise_4b()
    exercise_5()
