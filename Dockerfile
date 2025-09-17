# ------------------------------
# Stage 1: Build frontend
# ------------------------------
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Copy frontend source files
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build   # assumes output goes to frontend/dist

# ------------------------------
# Stage 2: Build Django backend
# ------------------------------
FROM python:3.11-slim

# Environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /backend

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django project
COPY backend/ .

# Copy built frontend
# Keep index.html & other files in frontend/dist for Django templates
COPY --from=frontend-build /frontend/dist/ ../frontend/dist/

# Optional: copy JS/CSS/other static assets to STATIC_ROOT too
COPY --from=frontend-build /frontend/dist/static/ ./static/

# Collect static files
RUN python manage.py collectstatic --noinput   # <-- FIXED PATH

# Expose port
EXPOSE 8000

# Run Django server (replace with gunicorn for production)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
