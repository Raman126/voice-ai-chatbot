# --- Voice AI Chatbot: FastAPI backend image ---
FROM python:3.11-slim

WORKDIR /app

# Install deps first so Docker can cache this layer when only source changes
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Not baked into the image — provided at `docker run` / compose time via env_file
ENV LLM_PROVIDER=groq

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
