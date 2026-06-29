# Use a lightweight official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables to optimize Python runtime
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to take advantage of Docker cache
COPY requirements.txt .

# Install requirements without cache to keep the image footprint minimal
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the default port
EXPOSE 8080

# Start Uvicorn pointing to main:app, binding to 0.0.0.0 and the dynamic GCP port env var
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
