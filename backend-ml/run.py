import os
import subprocess
import sys

def main():
  current_dir = os.path.dirname(os.path.abspath(__file__))
  models_dir = os.path.join(current_dir, 'models')
  
  rf_path = os.path.join(models_dir, 'random_forest.joblib')
  xgb_path = os.path.join(models_dir, 'xgboost.joblib')
  
  # Check if models exist
  if not os.path.exists(rf_path) or not os.path.exists(xgb_path):
    print("⚠️ ML models not found. Running training script...")
    train_script = os.path.join(current_dir, 'app', 'train.py')
    
    # Run training script in the current python environment
    result = subprocess.run([sys.executable, train_script], capture_output=False)
    if result.returncode != 0:
      print("❌ Error: Failed to train models. Aborting startup.")
      sys.exit(1)
  
  # Run FastAPI server
  print("🚀 Starting FastAPI Server on port 8000...")
  import uvicorn
  uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == '__main__':
  main()
