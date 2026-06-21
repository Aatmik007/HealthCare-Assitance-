const axios = require('axios');

// Standardized Clinical Vocabulary of Symptoms
const SYMPTOMS_LIST = [
  "Fever", "Cough", "Fatigue", "Shortness of breath", "Sore throat",
  "Headache", "Body ache", "Loss of taste/smell", "Runny nose", "Nausea/Vomiting",
  "Diarrhea", "Chest pain", "Chills", "Dizziness", "Skin rash",
  "Joint pain", "Sneezing", "Wheezing", "Heart palpitations", "Excessive thirst",
  "Frequent urination", "Blurred vision", "Unexplained weight loss", "Anxiety", "Insomnia",
  "Heartburn/Acid reflux", "Abdominal pain", "Swollen lymph nodes", "Itchy eyes", "Chronic fatigue"
];

// Fallback Rule-Based Classifier for Offline Resilience
const ruleBasedClassifier = (symptomIndices) => {
  // Convert indices to names
  const activeSymptoms = symptomIndices.map(idx => SYMPTOMS_LIST[idx]?.toLowerCase()).filter(Boolean);

  const diseaseRules = [
    {
      name: "Influenza (Flu)",
      symptoms: ["fever", "cough", "fatigue", "body ache", "chills", "sore throat"],
      description: "A highly contagious viral infection of the respiratory passages causing fever, severe aching, and catarrh.",
      recommendations: ["Rest abundantly", "Stay hydrated", "Consider over-the-counter fever reducers", "Consult doctor if symptoms worsen"]
    },
    {
      name: "COVID-19",
      symptoms: ["fever", "cough", "shortness of breath", "loss of taste/smell", "fatigue", "body ache"],
      description: "An infectious disease caused by the SARS-CoV-2 virus, affecting respiratory systems with varying severity.",
      recommendations: ["Self-isolate immediately", "Monitor blood oxygen level (SpO2)", "Take a PCR or Rapid Antigen test", "Seek emergency care if chest pain or shortness of breath occurs"]
    },
    {
      name: "Common Cold",
      symptoms: ["cough", "sore throat", "runny nose", "sneezing", "fatigue"],
      description: "A mild viral infection of the nose and throat.",
      recommendations: ["Stay warm and rest", "Drink warm fluids", "Use throat lozenges or nasal sprays"]
    },
    {
      name: "Asthma Flare-up",
      symptoms: ["shortness of breath", "wheezing", "cough", "chest pain"],
      description: "A respiratory condition marked by spasms in the bronchi of the lungs, causing difficulty in breathing.",
      recommendations: ["Use your rescue inhaler", "Avoid triggers like dust/pollen", "Sit upright and breathe slowly", "Seek emergency medical care if breathing does not improve"]
    },
    {
      name: "Migraine",
      symptoms: ["headache", "nausea/vomiting", "dizziness", "blurred vision"],
      description: "A recurrent throbbing headache that typically affects one side of the head, often accompanied by nausea and disturbed vision.",
      recommendations: ["Rest in a dark, quiet room", "Apply a cold compress to your head", "Stay hydrated", "Avoid bright screens"]
    },
    {
      name: "Diabetes Warning Sign",
      symptoms: ["excessive thirst", "frequent urination", "blurred vision", "unexplained weight loss", "fatigue"],
      description: "Common clinical indicators suggesting potential hyperglycemia or onset of insulin deficiency.",
      recommendations: ["Schedule a Fasting Blood Glucose test", "Limit intake of simple sugars", "Consult an endocrinologist"]
    },
    {
      name: "GERD (Acid Reflux)",
      symptoms: ["heartburn/acid reflux", "chest pain", "nausea/vomiting"],
      description: "Gastroesophageal reflux disease, causing stomach acid to repeatedly flow back into the tube connecting your mouth and stomach.",
      recommendations: ["Avoid lying down for 2-3 hours after eating", "Avoid spicy, greasy, or acidic foods", "Eat smaller meals"]
    },
    {
      name: "Gastrointestinal Infection",
      symptoms: ["nausea/vomiting", "diarrhea", "abdominal pain", "fever"],
      description: "Inflammation of the stomach and intestines, typically resulting from bacterial or viral toxins.",
      recommendations: ["Stay hydrated with ORS (Oral Rehydration Salts)", "Follow a bland diet (BRAT: Bananas, Rice, Applesauce, Toast)", "Wash hands frequently"]
    },
    {
      name: "Allergies (Allergic Rhinitis)",
      symptoms: ["sneezing", "runny nose", "itchy eyes"],
      description: "An allergic response to specific allergens such as pollen, dust mites, or pet dander.",
      recommendations: ["Avoid allergen exposure", "Use OTC antihistamines", "Rinse nasal passages with saline"]
    },
    {
      name: "Panic Attack / Acute Anxiety",
      symptoms: ["chest pain", "heart palpitations", "shortness of breath", "dizziness", "anxiety"],
      description: "A sudden episode of intense fear that triggers severe physical reactions when there is no real danger or apparent cause.",
      recommendations: ["Practice 4-7-8 breathing exercises", "Remind yourself that the feeling is temporary", "Find a quiet space", "Consult a therapist"]
    }
  ];

  let bestMatch = null;
  let highestScore = 0;

  for (const disease of diseaseRules) {
    const matchCount = disease.symptoms.filter(sym => activeSymptoms.includes(sym)).length;
    const score = matchCount > 0 ? (matchCount / disease.symptoms.length) : 0;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = disease;
    }
  }

  if (!bestMatch || highestScore < 0.2) {
    return {
      disease: "Undetermined Condition",
      confidence: 0,
      description: "Your combination of symptoms doesn't clearly match a specific profile. Please monitor closely.",
      recommendations: ["Consult a physician for a professional diagnosis", "Monitor vitals regularly", "Log symptoms daily"]
    };
  }

  return {
    disease: bestMatch.name,
    confidence: Math.round(highestScore * 100),
    description: bestMatch.description,
    recommendations: bestMatch.recommendations
  };
};

/**
 * Predicts the disease based on symptom checklist indices.
 * @param {Array<number>} symptomIndices - Array of 0-indexed indices representing selected symptoms.
 * @param {string} classifierType - 'random_forest' or 'xgboost'
 */
const getSymptomPrediction = async (symptomIndices, classifierType = 'random_forest') => {
  const pythonUrl = process.env.PYTHON_ML_SERVICE_URL || 'http://localhost:8000';
  
  try {
    const response = await axios.post(`${pythonUrl}/predict`, {
      symptom_indices: symptomIndices,
      classifier: classifierType
    }, { timeout: 2000 }); // Fast 2 second timeout for microservice checks
    
    return {
      disease: response.data.disease,
      confidence: response.data.confidence,
      description: response.data.description,
      recommendations: response.data.recommendations,
      classifier: response.data.classifier,
      mode: 'Machine Learning'
    };
  } catch (err) {
    console.warn(`⚠️ ML microservice offline (Could not connect to ${pythonUrl}). Falling back to local rule-engine.`);
    
    const fallbackResult = ruleBasedClassifier(symptomIndices);
    return {
      ...fallbackResult,
      classifier: 'Local Clinician Heuristics',
      mode: 'Rule-Engine Fallback'
    };
  }
};

module.exports = {
  getSymptomPrediction,
  SYMPTOMS_LIST
};
