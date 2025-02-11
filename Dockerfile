# Use Python 3.9 image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Create start script with error handling
RUN echo '#!/bin/bash\n\
echo "Starting application..."\n\
echo "Port: $PORT"\n\
echo "Database URL: ${DATABASE_URL:0:20}..."\n\
uvicorn app.main:app --host 0.0.0.0 --port "$PORT"' > start.sh && \
    chmod +x start.sh

# Command to run the application
CMD ["./start.sh"]