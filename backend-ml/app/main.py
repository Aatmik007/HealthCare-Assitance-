from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from app.classifier import SymptomClassifier

app = FastAPI(
  title="Aura Health ML Service",
  description="Python microservice serving Random Forest and XGBoost symptom classifiers",
  version="1.0.0"
)

# Enable CORS
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Initialize Classifier
classifier = SymptomClassifier()

class SymptomRequest(BaseModel):
  symptom_indices: List[int] = Field(..., description="List of symptom indices to check", min_items=1)
  classifier: Optional[str] = Field("random_forest", description="Model choice: 'random_forest' or 'xgboost'")

@app.post("/predict")
def predict_disease(request: SymptomRequest):
  try:
    classifier_type = request.classifier.lower()
    if classifier_type not in ['random_forest', 'xgboost']:
      raise HTTPException(status_code=400, detail="Invalid classifier choice. Choose 'random_forest' or 'xgboost'.")

    result = classifier.predict(request.symptom_indices, classifier_type)
    return result
  except RuntimeError as re:
    raise HTTPException(status_code=503, detail=str(re))
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@app.get("/health")
def health_check():
  models_loaded = (
    classifier.rf_model is not None and 
    classifier.xgb_model is not None and 
    classifier.le is not None
  )
  return {
    "status": "online",
    "models_loaded": models_loaded,
    "models_details": {
      "random_forest": classifier.rf_model.__class__.__name__ if classifier.rf_model else None,
      "xgboost": classifier.xgb_model.__class__.__name__ if classifier.xgb_model else None
    }
  }

if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
