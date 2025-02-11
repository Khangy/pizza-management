FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD python -c "import os; port = int(os.environ.get('PORT', '8000')); import uvicorn; uvicorn.run('app.main:app', host='0.0.0.0', port=port)"