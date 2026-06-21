import os
import joblib
import numpy as np

# Total number of symptoms
NUM_SYMPTOMS = 30

DISEASE_METADATA = {
  "Influenza (Flu)": {
    "description": "A highly contagious viral infection of the respiratory passages causing fever, severe aching, and catarrh.",
    "recommendations": ["Rest abundantly", "Stay hydrated", "Consider over-the-counter fever reducers", "Consult doctor if symptoms worsen"]
  },
  "COVID-19": {
    "description": "An infectious disease caused by the SARS-CoV-2 virus, affecting respiratory systems with varying severity.",
    "recommendations": ["Self-isolate immediately", "Monitor blood oxygen level (SpO2)", "Take a PCR or Rapid Antigen test", "Seek emergency care if chest pain or shortness of breath occurs"]
  },
  "Common Cold": {
    "description": "A mild viral infection of the nose and throat.",
    "recommendations": ["Stay warm and rest", "Drink warm fluids", "Use throat lozenges or nasal sprays"]
  },
  "Asthma Flare-up": {
    "description": "A respiratory condition marked by spasms in the bronchi of the lungs, causing difficulty in breathing.",
    "recommendations": ["Use your rescue inhaler", "Avoid triggers like dust/pollen", "Sit upright and breathe slowly", "Seek emergency medical care if breathing does not improve"]
  },
  "Migraine": {
    "description": "A recurrent throbbing headache that typically affects one side of the head, often accompanied by nausea and disturbed vision.",
    "recommendations": ["Rest in a dark, quiet room", "Apply a cold compress to your head", "Stay hydrated", "Avoid bright screens"]
  },
  "Diabetes Warning Sign": {
    "description": "Common clinical indicators suggesting potential hyperglycemia or onset of insulin deficiency.",
    "recommendations": ["Schedule a Fasting Blood Glucose test", "Limit intake of simple sugars", "Consult an endocrinologist"]
  },
  "GERD (Acid Reflux)": {
    "description": "Gastroesophageal reflux disease, causing stomach acid to repeatedly flow back into the tube connecting your mouth and stomach.",
    "recommendations": ["Avoid lying down for 2-3 hours after eating", "Avoid spicy, greasy, or acidic foods", "Eat smaller meals"]
  },
  "Gastrointestinal Infection": {
    "description": "Inflammation of the stomach and intestines, typically resulting from bacterial or viral toxins.",
    "recommendations": ["Stay hydrated with ORS (Oral Rehydration Salts)", "Follow a bland diet (BRAT: Bananas, Rice, Applesauce, Toast)", "Wash hands frequently"]
  },
  "Allergies (Allergic Rhinitis)": {
    "description": "An allergic response to specific allergens such as pollen, dust mites, or pet dander.",
    "recommendations": ["Avoid allergen exposure", "Use OTC antihistamines", "Rinse nasal passages with saline"]
  },
  "Panic Attack / Acute Anxiety": {
    "description": "A sudden episode of intense fear that triggers severe physical reactions when there is no real danger or apparent cause.",
    "recommendations": ["Practice 4-7-8 breathing exercises", "Remind yourself that the feeling is temporary", "Find a quiet space", "Consult a therapist"]
  }
}

class SymptomClassifier:
  def __init__(self):
    self.rf_model = None
    self.xgb_model = None
    self.le = None
    self.load_models()

  def load_models(self):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, '../models')
    
    rf_path = os.path.join(models_dir, 'random_forest.joblib')
    xgb_path = os.path.join(models_dir, 'xgboost.joblib')
    le_path = os.path.join(models_dir, 'label_encoder.joblib')

    if os.path.exists(rf_path) and os.path.exists(xgb_path) and os.path.exists(le_path):
      try:
        self.rf_model = joblib.load(rf_path)
        self.xgb_model = joblib.load(xgb_path)
        self.le = joblib.load(le_path)
        print("🚀 Machine Learning models loaded successfully.")
      except Exception as e:
        print(f"❌ Error loading models: {e}")
    else:
      print("⚠️ Trained models not found. Please train them first.")

  def predict(self, symptom_indices, classifier_type='random_forest'):
    if not self.rf_model or not self.xgb_model or not self.le:
      # If models aren't loaded, try to reload them once
      self.load_models()
      if not self.rf_model or not self.xgb_model or not self.le:
        raise RuntimeError("ML Models are not initialized/loaded.")

    # 1. Prepare feature vector (size: 30)
    features = np.zeros(NUM_SYMPTOMS)
    for idx in symptom_indices:
      if 0 <= idx < NUM_SYMPTOMS:
        features[idx] = 1

    features = features.reshape(1, -1)

    # 2. Select Classifier
    model = self.rf_model if classifier_type == 'random_forest' else self.xgb_model
    model_name = "Random Forest" if classifier_type == 'random_forest' else "XGBoost"

    # 3. Predict disease
    pred_class_encoded = model.predict(features)[0]
    disease = self.le.inverse_transform([pred_class_encoded])[0]

    # 4. Predict probability (confidence)
    probabilities = model.predict_proba(features)[0]
    confidence = int(np.max(probabilities) * 100)

    # 5. Extract metadata
    metadata = DISEASE_METADATA.get(disease, {
      "description": "Medical condition description is currently unavailable.",
      "recommendations": ["Consult a medical professional for details."]
    })

    return {
      "disease": disease,
      "confidence": confidence,
      "description": metadata["description"],
      "recommendations": metadata["recommendations"],
      "classifier": model_name
    }
