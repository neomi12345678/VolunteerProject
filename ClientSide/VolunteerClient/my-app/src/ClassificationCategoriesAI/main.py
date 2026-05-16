import os
import json
import numpy as np
import pyodbc
from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

conn_str = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=DESKTOP-1VUANBN;"
    "DATABASE=VolunteerDB;"
    "Trusted_Connection=yes;"
    "Encrypt=no;"
)

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "model_files")

if os.path.exists(model_path) and os.path.exists(os.path.join(model_path, "config.json")):
    print("Loading model from LOCAL disk")
    model = SentenceTransformer(model_path, local_files_only=True)
    print("Model loaded successfully")
else:
    print("WARNING: model not found")
    model = None


class Request(BaseModel):
    text: str


# --- פונקציה לטעינת קטגוריות וה-embeddings ---
def load_categories_update_embeddings():
    categories = []
    vectors = []

    if model is None:
        return categories, vectors

    with pyodbc.connect(conn_str) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT Id, Name, Description, Icon, Embedding FROM Categories")
        rows = cursor.fetchall()

        for row in rows:
            categories.append({
                "Id": row.Id,
                "Name": row.Name,
                "Description": row.Description,
                "Icon": row.Icon
            })

            try:
                update_embedding = False
                if row.Embedding is None or row.Embedding.strip() == "":
                    update_embedding = True
                else:
                    try:
                        loaded = json.loads(row.Embedding)
                        if not isinstance(loaded, list):
                            update_embedding = True
                    except:
                        update_embedding = True

                if update_embedding:
                    embedding = model.encode([row.Description])[0]
                    embedding_json = json.dumps(embedding.tolist())
                    cursor.execute(
                        "UPDATE Categories SET Embedding = ? WHERE Id = ?",
                        embedding_json, row.Id
                    )
                    vectors.append(embedding.astype(np.float32))
                    print(f"Updated embedding for category {row.Name}")
                else:
                    vectors.append(np.array(json.loads(row.Embedding), dtype=np.float32))

            except Exception as e:
                print("Embedding error:", e)
                vectors.append(np.zeros(384, dtype=np.float32))

        conn.commit()

    return categories, vectors


# --- פונקציה חכמה ליצירת שם ואייקון ---
def generate_category_name_icon(text):
    # ניקוי מילים מיותרות
    words = [w for w in text.split() if w.lower() not in ["i", "need", "help", "please", "someone", "my", "me", "with", "the","want"]]
    if not words:
        words = text.split()
    # שם קטגוריה – עד 2 מילים ראשונות
    name = " ".join(words[:3]).title()
    # התאמת אייקון לפי מילת מפתח
    keyword_icons = {
    "food": "🍲",
    "meal": "🥘",
    "study": "📚",
    "homework": "📖",
    "grocery": "🛒",
    "transport": "🚗",
    "medical": "💉",
    "child": "🍼",
    "pet": "🐶",
    "dog": "🐕",
    "cat": "🐈",
    "clean": "🧹",
    "community": "🏘️",
    "shopping": "🛍️",
    "clothes": "👕",
    "laundry": "🧺",
    "repair": "🔧",
    "electric": "💡",
    "plumbing": "🚿",
    "garden": "🌱",
    "moving": "📦",
    "delivery": "📬",
    "mail": "✉️",
    "phone": "📱",
    "computer": "💻",
    "internet": "🌐",
    "teaching": "🧑‍🏫",
    "school": "🏫",
    "elderly": "👴",
    "support": "🤝",
    "volunteer": "🙋",
    "event": "🎉",
    "holiday": "🎁",
    "security": "🔒",
    "legal": "⚖️",
    "finance": "💰",
    "bank": "🏦",
    "insurance": "🛡️",
    "health": "❤️",
    "pharmacy": "💊",
    "hospital": "🏥",
    "exercise": "🏃",
    "sports": "⚽",
    "bicycle": "🚴",
    "car": "🚙",
    "bus": "🚌",
    "taxi": "🚕",
    "train": "🚆",
    "flight": "✈️",
    "cleaning": "🧼",
    "trash": "🗑️",
    "recycling": "♻️",
    "painting": "🎨",
    "design": "🖌️",
    "music": "🎵",
    "reading": "📚",
    "writing": "✍️",
    "translation": "🌍",
    "language": "🗣️",
    "meeting": "📅",
    "planning": "📝",
    "schedule": "⏰",
    "time": "⌛",
    "weather": "🌦️",
    "emergency": "🚨",
    "fire": "🔥",
    "police": "👮",
    "water": "💧",
    "electricity": "⚡",
    "family": "👨‍👩‍👧‍👦",
    "friends": "👫",
    "help": "🆘",
    "assistance": "🤲"
}
    icon = "✨"
    for word in words:
        key = word.lower()
        if key in keyword_icons:
            icon = keyword_icons[key]
            break
    return name, icon


@app.post("/classify")
def classify(req: Request):
    try:
        if model is None:
            return {"error": "model not loaded"}

        text_vec = model.encode([req.text])[0].astype(np.float32)
        categories, vectors = load_categories_update_embeddings()

        if len(categories) == 0:
            name, icon = generate_category_name_icon(req.text)
            with pyodbc.connect(conn_str) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO Categories (Name, Description, Icon, Embedding) VALUES (?, ?, ?, ?)",
                    name, req.text, icon, json.dumps(text_vec.tolist())
                )
                conn.commit()
            return {"category": name, "icon": icon, "score": 0.0, "status": "create_new_category"}

        sims = cosine_similarity([text_vec], vectors)[0]
        best_idx = int(np.argmax(sims))
        best_score = float(sims[best_idx])

        MATCH_THRESHOLD = 0.25

        if best_score >= MATCH_THRESHOLD:
            matched_category = categories[best_idx]
            return {"category": matched_category["Name"], "icon": matched_category["Icon"], "score": best_score, "status": "matched"}

        # אין התאמה → צור קטגוריה חדשה חכמה
        name, icon = generate_category_name_icon(req.text)
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO Categories (Name, Description, Icon, Embedding) VALUES (?, ?, ?, ?)",
                name, req.text, icon, json.dumps(text_vec.tolist())
            )
            conn.commit()

        return {"category": name, "icon": icon, "score": best_score, "status": "create_new_category"}

    except Exception as e:
        return {"error": str(e), "status": "failed"}


@app.get("/health")
def health_check():
    return {"status": "up", "model_loaded": model is not None}
