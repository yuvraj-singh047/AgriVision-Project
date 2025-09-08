# app.py - Final Corrected Version

from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
from PIL import Image
import numpy as np
import io

# Initialize the Flask application
app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# --- Load the saved AI model ---
MODEL_PATH = 'plant_disease_model.h5'
model = load_model(MODEL_PATH)
print("Model loaded successfully!")

# --- Get Class Names from the text file ---
def load_class_names(file_path):
    try:
        with open(file_path, 'r') as f:
            class_names = [line.strip() for line in f.readlines()]
        print(f"Successfully loaded {len(class_names)} class names.")
        return class_names
    except FileNotFoundError:
        print(f"FATAL ERROR: '{file_path}' not found. The application cannot determine disease names.")
        return []

CLASS_NAMES_PATH = 'class_names.txt'
class_names = load_class_names(CLASS_NAMES_PATH)

# --- Image preparation function ---
def prepare_image(image, target_size):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0
    return image

# --- Prediction endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    if not class_names:
        return jsonify({'error': 'Server error: Class names not loaded'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    try:
        img_bytes = file.read()
        image = Image.open(io.BytesIO(img_bytes))
        
        processed_image = prepare_image(image, target_size=(224, 224))
        
        prediction_array = model.predict(processed_image)
        
        predicted_class_index = np.argmax(prediction_array)
        predicted_class_name = class_names[predicted_class_index]

        return jsonify({'prediction': predicted_class_name})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': 'Failed to process image'}), 500

# --- Run the application ---
if __name__ == '__main__':
    # Running with debug=False is safer, but you can turn it on for development
    app.run(host='0.0.0.0', port=5000, debug=False)