# Aura Health - AI-Powered Smart Healthcare Assistant

A secure, modular, production-ready healthcare platform that allows users to record vitals, analyze symptom profiles via Machine Learning (Random Forest & XGBoost classifiers), upload medical reports with automatic OCR text extraction, and view personalized healthcare recommendations.

Designed with a premium glassmorphic interface built following modern clinical visual guidelines.

---

## Technical Stack & Architecture

### 1. Frontend Client (`frontend/`)
- **Core:** React.js, Vite
- **Styling:** Custom CSS design system with HSL clinical palettes, frosted translucent cards, and heartbeat animations.
- **Analytics:** Recharts for historical vital plotting.
- **Iconography:** Lucide Icons.

### 2. Primary API Server (`backend/`)
- **Core:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose) with **automatic failover** to a local JSON-file storage system (`db_fallback/`) if no database connection is configured, enabling instant zero-config startup.
- **Security:** bcryptjs for secure password hashing and JSON Web Tokens (JWT) for route authorization.
- **OCR Engine:** Tesseract.js running server-side, with custom Regex pattern parsers to extract key biomarkers.

### 3. ML Inference Service (`backend-ml/`)
- **Core:** Python, FastAPI, Uvicorn
- **Classifiers:** Scikit-Learn (Random Forest) and XGBoost models.
- **Trainer:** An automated training utility (`train.py`) that generates 2,000 synthetic clinical cases across 10 disease categories and saves serialization logs.
- **Resilience:** The primary Express API features a **rule-engine fallback**; if the Python service is offline, symptom checks gracefully fall back to clinical rules rather than erroring out.

---

## Directory Structure

```
smart-healthcare-assistant/
├── backend/                  # Node.js/Express Server
│   ├── config/               # DB connection & settings
│   ├── controllers/          # Business logic layers
│   ├── db_fallback/          # Local JSON database storage (failover)
│   ├── middleware/           # JWT & file upload gates
│   ├── models/               # Hybrid DB model wrappers
│   ├── routes/               # Express routing
│   ├── services/             # OCR parser & ML client proxier
│   └── server.js             # API entrypoint
├── backend-ml/               # Python FastAPI ML Server
│   ├── app/
│   │   ├── main.py           # FastAPI entrypoint
│   │   ├── classifier.py     # Predict wrappers
│   │   └── train.py          # Model training compiler
│   └── run.py                # Model loader & server trigger
├── frontend/                 # Vite/React Frontend Client
│   ├── src/                  # Component and Context folders
│   └── index.html            # Main markup page
└── README.md                 # Setup & Guide
```

---

## Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3.8+](https://www.python.org/downloads/)
- MongoDB (Optional - the server will run on a local JSON database failover if MongoDB is not present).

---

### Step 1: Install Primary API Server & OCR Engine
Navigate to the `backend/` directory:
```bash
cd backend
npm install
```

Configure settings in `backend/.env` (a pre-configured template is already generated):
```env
PORT=5000
JWT_SECRET=super_secret_aura_health_clinical_assistant_token_key_dev
MONGODB_URI=mongodb://localhost:27017/aura-health
PYTHON_ML_SERVICE_URL=http://localhost:8000
```

---

### Step 2: Install ML Service Classifiers
Navigate to the `backend-ml/` directory:
```bash
cd ../backend-ml
pip install -r requirements.txt
```

---

### Step 3: Install Frontend Client Dashboard
Navigate to the `frontend/` directory:
```bash
cd ../frontend
npm install
```

---

## Running the Application

To run the complete platform, start the three modules concurrently:

### 1. Launch ML Classifiers (Python Backend)
From the `backend-ml/` directory, launch the startup wrapper:
```bash
python run.py
```
> [!NOTE]
> On the first startup, `run.py` will detect that trained models are missing, automatically invoke the training compiler (`train.py`), generate dataset representations, train Random Forest and XGBoost classifiers, and output logs to `models/` before launching the FastAPI server on `http://127.0.0.1:8000`.

### 2. Launch Primary API (Node.js Express Backend)
From the `backend/` directory, run the development script:
```bash
npm run dev
```
The server will bind to `http://localhost:5000`. It will log whether it succeeded in connecting to MongoDB, or if it has initialized the local JSON DB fallback folder.

### 3. Launch Frontend Client (Vite Dev Server)
From the `frontend/` directory, start the UI:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. The Vite server proxies API calls directly to the Node.js backend.

---

## Verification and Usage

1. **User Sign Up:** Log in or create an account. On the dashboard, update your medical profile (age, blood type, chronic conditions) to customize recommendations.
2. **Vitals Tracker:** Enter heart rate, blood pressure, temperature, and SpO2. Outliers are color-coded in the logs list and mapped in the Recharts diagram.
3. **Symptom Checker:** Checklist active symptoms and choose a model. Use **Compare Classifiers** to observe side-by-side diagnostic confidence results from Random Forest and XGBoost.
4. **OCR Reports Upload:** Upload a scanned report image (JPG/PNG). Observe Tesseract.js extracting text transcripts and highlight normal vs abnormal markers.
#