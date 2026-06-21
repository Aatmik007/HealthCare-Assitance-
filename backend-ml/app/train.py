import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import xgboost as xgb

# Core symptoms list mapping (exactly aligned with Express server)
SYMPTOMS = [
  "Fever", "Cough", "Fatigue", "Shortness of breath", "Sore throat",
  "Headache", "Body ache", "Loss of taste/smell", "Runny nose", "Nausea/Vomiting",
  "Diarrhea", "Chest pain", "Chills", "Dizziness", "Skin rash",
  "Joint pain", "Sneezing", "Wheezing", "Heart palpitations", "Excessive thirst",
  "Frequent urination", "Blurred vision", "Unexplained weight loss", "Anxiety", "Insomnia",
  "Heartburn/Acid reflux", "Abdominal pain", "Swollen lymph nodes", "Itchy eyes", "Chronic fatigue"
]

DISEASES = [
  "Influenza (Flu)", "COVID-19", "Common Cold", "Asthma Flare-up", 
  "Migraine", "Diabetes Warning Sign", "GERD (Acid Reflux)", 
  "Gastrointestinal Infection", "Allergies (Allergic Rhinitis)", 
  "Panic Attack / Acute Anxiety"
]

# Profiles of symptoms (index of symptom -> typical probability of presence)
DISEASE_PROFILES = {
  "Influenza (Flu)": {
    "core": [0, 1, 2, 6, 12, 4], # Fever, Cough, Fatigue, Body ache, Chills, Sore throat
    "prob_core": 0.85,
    "prob_other": 0.10
  },
  "COVID-19": {
    "core": [0, 1, 3, 7, 2, 6], # Fever, Cough, Shortness of breath, Loss of taste/smell, Fatigue, Body ache
    "prob_core": 0.90,
    "prob_other": 0.08
  },
  "Common Cold": {
    "core": [1, 4, 8, 16, 2], # Cough, Sore throat, Runny nose, Sneezing, Fatigue
    "prob_core": 0.80,
    "prob_other": 0.05
  },
  "Asthma Flare-up": {
    "core": [3, 17, 1, 11], # Shortness of breath, Wheezing, Cough, Chest pain
    "prob_core": 0.85,
    "prob_other": 0.05
  },
  "Migraine": {
    "core": [5, 9, 13, 21], # Headache, Nausea/Vomiting, Dizziness, Blurred vision
    "prob_core": 0.90,
    "prob_other": 0.07
  },
  "Diabetes Warning Sign": {
    "core": [19, 20, 21, 22, 2], # Excessive thirst, Frequent urination, Blurred vision, Weight loss, Fatigue
    "prob_core": 0.85,
    "prob_other": 0.08
  },
  "GERD (Acid Reflux)": {
    "core": [25, 11, 9], # Heartburn, Chest pain, Nausea
    "prob_core": 0.80,
    "prob_other": 0.06
  },
  "Gastrointestinal Infection": {
    "core": [9, 10, 26, 0], # Nausea/Vomiting, Diarrhea, Abdominal pain, Fever
    "prob_core": 0.85,
    "prob_other": 0.05
  },
  "Allergies (Allergic Rhinitis)": {
    "core": [16, 8, 28], # Sneezing, Runny nose, Itchy eyes
    "prob_core": 0.90,
    "prob_other": 0.04
  },
  "Panic Attack / Acute Anxiety": {
    "core": [11, 18, 3, 13, 23], # Chest pain, Heart palpitations, Shortness of breath, Dizziness, Anxiety
    "prob_core": 0.85,
    "prob_other": 0.08
  }
}

def generate_synthetic_data(num_samples_per_disease=200):
  """Generates a synthetic dataframe of symptom features and disease targets."""
  np.random.seed(42)
  data = []
  
  for label, profile in DISEASE_PROFILES.items():
    core_symptoms = profile["core"]
    p_core = profile["prob_core"]
    p_other = profile["prob_other"]
    
    for _ in range(num_samples_per_disease):
      row = np.zeros(len(SYMPTOMS))
      for i in range(len(SYMPTOMS)):
        prob = p_core if i in core_symptoms else p_other
        row[i] = 1 if np.random.rand() < prob else 0
      
      data.append(list(row) + [label])
      
  columns = SYMPTOMS + ["Disease"]
  return pd.DataFrame(data, columns=columns)

def train_and_save_models():
  print("🔄 Step 1: Generating clinical synthetic dataset...")
  df = generate_synthetic_data(250)
  
  X = df[SYMPTOMS]
  y = df["Disease"]
  
  # Encode labels to integers for XGBoost
  from sklearn.preprocessing import LabelEncoder
  le = LabelEncoder()
  y_encoded = le.fit_transform(y)
  
  X_train, X_test, y_train, y_test = train_test_split(X, y_encoded, test_size=0.2, random_state=42)
  
  print("🔄 Step 2: Training Random Forest Classifier...")
  rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
  rf_model.fit(X_train, y_train)
  rf_preds = rf_model.predict(X_test)
  rf_acc = accuracy_score(y_test, rf_preds)
  print(f"✅ Random Forest Validation Accuracy: {rf_acc:.2%}")
  
  print("🔄 Step 3: Training XGBoost Classifier...")
  xgb_model = xgb.XGBClassifier(use_label_encoder=False, eval_metric='mlogloss', random_state=42)
  xgb_model.fit(X_train, y_train)
  xgb_preds = xgb_model.predict(X_test)
  xgb_acc = accuracy_score(y_test, xgb_preds)
  print(f"✅ XGBoost Validation Accuracy: {xgb_acc:.2%}")
  
  # Save directories
  models_dir = path_resolve_dir()
  
  print("🔄 Step 4: Saving models and label encoder...")
  joblib.dump(rf_model, os.path.join(models_dir, 'random_forest.joblib'))
  joblib.dump(xgb_model, os.path.join(models_dir, 'xgboost.joblib'))
  joblib.dump(le, os.path.join(models_dir, 'label_encoder.joblib'))
  print(f"🚀 Success: Saved classifiers in {models_dir}!")

def path_resolve_dir():
  current_dir = os.path.dirname(os.path.abspath(__file__))
  target_dir = os.path.join(current_dir, '../models')
  if not os.path.exists(target_dir):
    os.makedirs(target_dir, exist_ok=True)
  return target_dir

if __name__ == '__main__':
  train_and_save_models()

