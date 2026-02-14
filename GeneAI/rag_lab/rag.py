import os
import glob
import numpy as np
from openai import OpenAI
from dotenv import load_dotenv
import pdfplumber
import pytesseract
from PIL import Image


load_dotenv()      
client = OpenAI()

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# --------------------------------------------------------
# 1. Load documents
# --------------------------------------------------------

def load_documents(path=None):
    if path is None:
        # Use path relative to script directory
        path = os.path.join(SCRIPT_DIR, "rag_docs", "*")
    docs = []
    docs = []

    for fname in glob.glob(path):
        if fname.endswith(".txt"):
            with open(fname, "r") as f:
                raw_text = f.read().strip()
        elif fname.endswith(".pdf"):
            raw_text = extract_text_from_pdf(fname)
        else:
            continue

        if len(raw_text) < 100:
            continue

        chunks = chunk_text(raw_text, fname)

        docs.extend(chunks)

    return docs



# --------------------------------------------------------
# 2. Read in text from PDF scans/images
# --------------------------------------------------------

def extract_text_from_pdf(pdf_path):
    text = ""

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages):
            page_text = page.extract_text()

            if page_text and len(page_text.strip()) > 50:
                text += page_text + "\n"
            else:
                try:
                    img = page.to_image(resolution=300).original
                    if not isinstance(img, Image.Image):
                        img = img.convert("RGB")
                    ocr_text = pytesseract.image_to_string(img)
                except Exception as e:
                    print(f"Warning: OCR failed for page {page_num} in {pdf_path}: {e}")
                    ocr_text = ""

                # Filter obvious OCR garbage
                if len(ocr_text.strip()) > 30:
                    text += ocr_text + "\n"

    return text.strip()


# --------------------------------------------------------
# 3. Break document text into chunks
# --------------------------------------------------------
def chunk_text(text, fname, chunk_size=500, overlap=100):
    chunks = []
    start = 0
    i = 0

    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]

        chunks.append({
            "filename": os.path.basename(fname),
            "index": i,
            "text": chunk
        })

        start = end - overlap
        i += 1

    return chunks

# --------------------------------------------------------
# 4. Convert the document text chunks into vector embeddings
# --------------------------------------------------------
def embed_text(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    emb = np.array(response.data[0].embedding)
    return emb / np.linalg.norm(emb)


# --------------------------------------------------------
# 5. Perform similarity search by calculating the cosine similarity score
# --------------------------------------------------------
def cosine_similarity(a, b):
    return np.dot(a, b)


# --------------------------------------------------------
# 6. Get top-k similar documents
# --------------------------------------------------------
def retrieve_relevant_docs(question, docs, k=3):
    q_emb = embed_text(question)
    scored = []
    for d in docs:
        sim = cosine_similarity(q_emb, d["embedding"])
        scored.append((sim, d))
    scored.sort(reverse=True, key=lambda x: x[0])
    return [d for _, d in scored[:k]]


# --------------------------------------------------------
# 7. Get LLM response
# --------------------------------------------------------
def get_response(user_message, retrieved_docs):
    context = "\n\n".join(
        [f"Guideline from {d['filename']}:\n{d['text']}" for d in retrieved_docs]
    )
    print(context)

    prompt = f"""    
    You are a medical support assistant. Your role is to address the following question consistent 
    with established healthcare treatment protocols.

    IMPORTANT RULES:
    - You are NOT diagnosing a patient.
    - You are NOT creating new medical advice.
    - You must base your response ONLY on the provided protocol excerpts.
    - If the protocols do not address the situation, clearly say so.

    CLINICAL PROTOCOL DOCUMENTATION:
    {context}

    USER'S QUESTION:
    "{user_message}"

    TASK:
    1. Determine the answer to the question
    2. Use only the provided context and explain why.
    3. Cite the source if possible - provide the source name and display the exact text where the answer is from
    4. Do not introduce information not present in the protocols.
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": prompt}
        ]
    )
    return response.choices[0].message.content


# --------------------------------------------------------
# 8. Simple app loop
# --------------------------------------------------------
if __name__ == "__main__":
    print("Building RAG System...")
    docs = load_documents()
    print(f"Loaded {len(docs)} chunks")

    for d in docs:
        d["embedding"] = embed_text(d["text"])
    
    print("Ready to start!\n")

    while True:
        user_msg = input("\nEnter a message to check (or 'quit'): ")
        if user_msg.lower() == "quit":
            break

        top_docs = retrieve_relevant_docs(user_msg, docs)

        response = get_response(user_msg, top_docs)
        print(response)
