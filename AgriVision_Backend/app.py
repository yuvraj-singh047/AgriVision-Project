import os
import io
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from keras.models import load_model
from PIL import Image

# -----------------------------
# Setup
# -----------------------------
load_dotenv() 

BASE_DIR = os.path.dirname(os.path.realpath(__file__))

app = Flask(__name__)
CORS(app)

# --- Configure Google AI (Gemini) ---
try:
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
    # --- UPDATED: Use the correct, latest model name ---
    gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("✅ Google AI Gemini model configured successfully!")
except Exception as e:
    gemini_model = None
    print(f"❌ WARNING: Could not configure Google AI. Chatbot will be disabled. Error: {e}")

# Load the AgriVision model
MODEL_PATH = os.path.join(BASE_DIR, 'agrivision_model_final.h5')
try:
    model = load_model(MODEL_PATH)
    print("✅ AgriVision model loaded successfully!")
except Exception as e:
    model = None
    print(f"❌ FATAL ERROR: Could not load model from '{MODEL_PATH}'. Error: {e}")

# Load the corresponding class names
CLASS_NAMES_PATH = os.path.join(BASE_DIR, 'class_names.txt')
try:
    with open(CLASS_NAMES_PATH, 'r') as f:
        class_names = [line.strip() for line in f.readlines()]
    print(f"✅ Successfully loaded {len(class_names)} class names.")
except Exception as e:
    class_names = []
    print(f"❌ FATAL ERROR: Could not load class names from '{CLASS_NAMES_PATH}'. Error: {e}")

# (Your treatment_database and prepare_image function would go here)
# ...
treatment_database = {
    "Apple___Apple_scab": "Treatment: Apply a fungicide containing Captan or a copper-based solution. Prune infected areas and ensure proper air circulation.",
    "Apple___Black_rot": "Treatment: Prune out cankered limbs and remove mummified fruit. Apply fungicides like Captan or Mancozeb starting from bud break.",
    "Apple___Cedar_apple_rust": "Treatment: Use resistant apple varieties. Apply fungicides such as myclobutanil or mancozeb during the infection period.",
    "Cherry_(including_sour)___Powdery_mildew": "Treatment: Apply sulfur-based or potassium bicarbonate fungicides. Improve air circulation through pruning.",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Treatment: Use resistant hybrids. Fungicide application (pyraclostrobin, azoxystrobin) may be necessary in high-risk conditions.",
    "Corn_(maize)___Common_rust_": "Treatment: Most field corn hybrids are resistant. For sweet corn, fungicides like pyraclostrobin can be effective if applied early.",
    "Corn_(maize)___Northern_Leaf_Blight": "Treatment: Plant resistant hybrids. Apply fungicides when lesions appear on lower leaves before tasseling.",
    "Grape___Black_rot": "Treatment: Apply fungicides such as mancozeb or myclobutanil. Remove infected berries and tendrils. Improve air circulation.",
    "Grape___Esca_(Black_Measles)": "Treatment: No effective fungicide. Prune out dead wood in winter. Manage vine stress with proper irrigation and nutrition.",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Treatment: Generally minor. Practice good sanitation. If severe, fungicides used for black rot are effective.",
    "Orange___Haunglongbing_(Citrus_greening)": "Treatment: There is no cure. Remove infected trees immediately to prevent spread. Control the Asian citrus psyllid vector.",
    "Peach___Bacterial_spot": "Treatment: Use copper-based bactericides during dormancy. Plant resistant varieties. Avoid high-nitrogen fertilizers.",
    "Pepper,_bell___Bacterial_spot": "Treatment: Apply copper-based bactericides. Rotate crops. Use disease-free seeds and transplants.",
    "Potato___Early_blight": "Treatment: Apply fungicides containing chlorothalonil or mancozeb. Maintain adequate plant nutrition and water.",
    "Potato___Late_blight": "Treatment: Apply fungicides containing chlorothalonil, mancozeb, or copper. Destroy infected foliage and tubers.",
    "Squash___Powdery_mildew": "Treatment: Apply fungicides containing sulfur, potassium bicarbonate, or neem oil. Ensure good air circulation.",
    "Strawberry___Leaf_scorch": "Treatment: Use resistant varieties. Apply fungicides during periods of rapid growth. Remove old, infected leaves after harvest.",
    "Tomato___Bacterial_spot": "Treatment: Use copper-based bactericides. Avoid overhead watering. Rotate crops and use disease-free seeds.",
    "Tomato___Early_blight": "Treatment: Apply fungicides with chlorothalonil or mancozeb. Stake or cage plants to improve air circulation.",
    "Tomato___Late_blight": "Treatment: Apply a copper-based fungicide or products containing chlorothalonil. Remove and destroy infected plants.",
    "Tomato___Leaf_Mold": "Treatment: Ensure good ventilation, especially in greenhouses. Apply fungicides like chlorothalonil or copper oxychloride.",
    "Tomato___Septoria_leaf_spot": "Treatment: Apply fungicides containing chlorothalonil. Remove lower infected leaves. Mulch around plants.",
    "Tomato___Spider_mites Two-spotted_spider_mite": "Treatment: Use insecticidal soaps or horticultural oils. Introduce predatory mites as a biological control.",
    "Tomato___Target_Spot": "Treatment: Apply fungicides such as chlorothalonil or mancozeb. Improve air circulation and avoid overhead watering.",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Treatment: No cure. Control the whitefly vector with insecticides or physical barriers like netting. Remove infected plants.",
    "Tomato___Tomato_mosaic_virus": "Treatment: No cure. Remove and destroy infected plants. Practice good sanitation and wash hands after handling plants.",
    "default": "Consult a local agricultural extension office for the most accurate and region-specific treatment advice."
}

def prepare_image(image, target_size=(224, 224)):
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(target_size)
    image = np.array(image)
    image = np.expand_dims(image, axis=0)
    image = image / 255.0
    return image
# -----------------------------
# Chatbot Endpoint
# -----------------------------
@app.route('/chat', methods=['POST'])
def chat():
    if not gemini_model:
        return jsonify({'error': 'Google AI service is not configured on the server.'}), 503

    data = request.get_json()
    user_message = data.get("message")

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    prompt = f"""
    You are AgriBot, an expert AI assistant for farmers, specializing in plant health. 
    Your tone is helpful, encouraging, and easy to understand.
    A farmer has asked the following question: "{user_message}"
    
    Provide a concise and practical answer.
    """
    
    try:
        response = gemini_model.generate_content(prompt)
        return jsonify({'reply': response.text})
    except Exception as e:
        print(f"❌ Error during Gemini API call: {e}")
        return jsonify({'error': 'Failed to get a response from the AI assistant.'}), 500

@app.route('/predict', methods=['POST'])
def predict():
    if not class_names:
        return jsonify({'error': 'Server error: Class names not loaded'}), 500
    if model is None:
        return jsonify({'error': 'Server error: Model not loaded'}), 500
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    try:
        img_bytes = file.read()
        image = Image.open(io.BytesIO(img_bytes))
        processed_image = prepare_image(image, target_size=(224, 224))
        
        prediction_array = model.predict(processed_image)[0]
        confidence = float(np.max(prediction_array))
        predicted_class_index = int(np.argmax(prediction_array))
        predicted_class_name = class_names[predicted_class_index]
        
        if predicted_class_name == "Not_A_Leaf_Images":
            display_name = "Not a recognizable plant leaf"
            recommendation = "Please upload a clear image of a single plant leaf for diagnosis."
        elif "healthy" in predicted_class_name:
            display_name = predicted_class_name.replace("___", " - ")
            recommendation = "The plant appears healthy. No treatment is necessary. Continue standard care."
        else:
            display_name = predicted_class_name.replace("___", " - ").replace("_", " ")
            recommendation = treatment_database.get(predicted_class_name, treatment_database["default"])
            
        return jsonify({
            'prediction': display_name,
            'confidence': confidence,
            'recommendation': recommendation
        })

    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return jsonify({'error': 'Failed to process image'}), 500
# -----------------------------
# Run App
# -----------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

