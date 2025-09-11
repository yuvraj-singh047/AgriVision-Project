# Use Python 3.11 slim base image
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# Copy your requirements file into the container
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the rest of your project into the container
COPY . .

# Command to run your app with a production server (Gunicorn)
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080"]
