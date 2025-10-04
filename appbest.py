import os
import pickle
import numpy as np
from flask import Flask, render_template, request, jsonify
import logging
import requests
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
# --- Configuration and Setup ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'exoplanet_model.pkl')  # Adjust if in models/

REQUIRED_FEATURES = 13
MAX_BATCH_SIZE = 100
MAX_CONTENT_LENGTH = 1 * 1024 * 1024 * 1024 * 1024  # 1024 GB




from transformers import pipeline

# model_name = "microsoft/DialoGPT-medium"
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForCausalLM.from_pretrained(model_name)

# generator = pipeline(
#     "text-generation",
#     model=model,
#     tokenizer=tokenizer,
#     max_new_tokens=60,
#     pad_token_id=tokenizer.eos_token_id
# )

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

UPLOAD_FOLDER = os.path.join(BASE_DIR, "user_models")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"pkl"}


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model variable
model = None


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
# --- Model Loading ---
def load_model():

    
    """Load the pre-trained model on application startup."""
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        logger.info(f"✅ Model loaded successfully from: {MODEL_PATH}")
        return model
    except FileNotFoundError:
        logger.error(f"❌ Model file not found at {MODEL_PATH}")
        return False
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        return False

# Load model on startup
with app.app_context():
    load_model()

# --- Utility Functions ---
def validate_and_process_input(data_list):
    """
    Validates and transforms incoming data into a NumPy array for prediction.
    Expects a list of records where each record is a list of 13 numerical features.
    """
    if not isinstance(data_list, list):
        raise ValueError("Input must be a list of data records.")
    
    if not data_list:
        raise ValueError("Input list is empty.")

    if len(data_list) > MAX_BATCH_SIZE:
        raise ValueError(f"Batch size limit exceeded. Maximum is {MAX_BATCH_SIZE} records.")

    processed_data = []
    
    for i, record in enumerate(data_list):
        # Handle both list and dict formats
        if isinstance(record, dict):
            # Extract numerical features, excluding 'name' or other non-numeric fields
            try:
                features = [
                    record.get('orbital_period', 0),
                    record.get('planet_radius', 0),
                    record.get('star_temp', 0),
                    record.get('star_radius', 0),
                    record.get('transit_depth', 0),
                    record.get('transit_duration', 0),
                    record.get('equilibrium_temp', 0),
                    record.get('star_logg', 0),
                    record.get('star_mass', 0),
                    record.get('star_metallicity', 0),
                    record.get('signal_to_noise', 0),
                    record.get('insolation_flux', 0),
                    record.get('planet_mass_earth', 0)
                ]
            except Exception as e:
                raise ValueError(f"Record {i}: Error extracting features - {str(e)}")
        elif isinstance(record, (list, tuple)):
            features = list(record)
        else:
            raise TypeError(f"Record {i} must be a list, tuple, or dictionary.")
        
        if len(features) != REQUIRED_FEATURES:
            raise ValueError(f"Record {i} has {len(features)} features, expected {REQUIRED_FEATURES}.")
        
        # Convert all features to floats
        try:
            numeric_features = [float(f) for f in features]
            processed_data.append(numeric_features)
        except (ValueError, TypeError) as e:
            raise ValueError(f"Record {i} contains non-numeric data: {str(e)}")

    return np.array(processed_data)

# --- Frontend Routes ---
@app.route('/')
def index():
    """Serve the main landing page."""
    return render_template('index.html')

# @app.route("/api/chat", methods=["POST"])
# def chat():
#     user_message = request.json.get("message", "")

#     try:
#         # Generate a reply
#         result = generator(user_message)
#         reply = result[0]["generated_text"]

#         # Trim input from reply (so it doesn't repeat the user message)
#         reply = reply.replace(user_message, "").strip()
#         if not reply:
#             reply = "🤖 I'm not sure what to say!"

#     except Exception as e:
#         reply = f"⚠️ Error: {str(e)}"

#     return jsonify({"response": reply})


@app.route('/analyze')
def analyze_page():
    """Serve the prediction/analysis page."""
    return render_template('secondpage.html')

@app.route('/planet')
def planet_page():
    """Serve the 3D planet generator page."""
    return render_template('planet.html')


@app.route('/api/upload_model', methods=['POST'])
def upload_model():
    if 'file' not in request.files:
        return jsonify({"success": False, "message": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"success": False, "message": "Empty filename"}), 400
    
    if file and allowed_file(file.filename):
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], "user_model.pkl")
        file.save(filepath)
        try:
            with open(filepath, 'rb') as f:
                user_model = pickle.load(f)
            global model
            model = user_model
            logger.info("✅ User model loaded successfully")
            return jsonify({"success": True, "message": "Model uploaded and loaded"}), 200
        except Exception as e:
            logger.error(f"Model load error: {e}")
            return jsonify({"success": False, "message": f"Error loading model: {e}"}), 400
    
    return jsonify({"success": False, "message": "Invalid file type"}), 400

# --- API Endpoints ---
@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        input_data = request.get_json(force=True)
        data_list = input_data["data"]

        # Process input
        processed_data = validate_and_process_input(data_list)[0]
        processed_data_v2 = list(processed_data) + [0, 0, 0, 0, 0]
        np_processed_data = np.array(processed_data_v2).reshape(1, 18)

        # Load model
        model = load_model()
        mod = model["best_model"]
        class_names = model["class_names"]
        metrics = model["performance_metrics"]

        # Predict
        pred = mod.predict(np_processed_data)[0]
        label = class_names[pred]

        # Confidence (optional if supported)
        try:
            proba = mod.predict_proba(np_processed_data)[0].max() * 100
        except:
            proba = 0

        # Prepare response
        results = [{
            "name": data_list[0].get("name", "Planet"),
            "prediction": label,
            "confidence": round(proba, 2),
            "features": data_list[0],
            "habitable": "Yes" if label == "CONFIRMED" else "No"
        }]

        return jsonify({
            "success": True,
            "results": results,
            "metrics": {
                "test_accuracy": round(metrics["test_accuracy"], 3),
                "test_f1": round(metrics["test_f1"], 3),
                "cv_mean": round(metrics["cv_mean"], 3)
            }
        }), 200

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            "success": False,
            "message": f"Error: {str(e)}"
        }), 400

    

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    }), 200

# --- Error Handlers ---
@app.errorhandler(413)
def request_entity_too_large(error):
    """Handle requests that exceed size limit."""
    return jsonify({
        'success': False, 
        'message': 'Request too large. Maximum size is 1MB.'
    }), 413

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False, 
        'message': 'Endpoint not found.'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors."""
    logger.error(f"Internal error: {error}")
    return jsonify({
        'success': False, 
        'message': 'Internal server error.'
    }), 500

# --- Run Application ---
if __name__ == '__main__':
    # For local development
    app.run(debug=True, host='0.0.0.0', port=5000)