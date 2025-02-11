# Use Python 3.9 image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Create start script
RUN echo "#!/bin/bash\nuvicorn app.main:app --host 0.0.0.0 --port \$PORT" > start.sh && \
    chmod +x start.sh

# Command to run the application
CMD ["./start.sh"]