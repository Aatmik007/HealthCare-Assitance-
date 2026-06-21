/**
 * Analyzes latest vitals, demographic profiles, and medical reports 
 * to generate personalized clinical recommendations.
 * @param {object} user - User profile data (age, chronicConditions, etc.)
 * @param {object} latestVital - Latest vital log data
 * @param {Array} reports - User's medical reports
 * @returns {Array<object>} - Array of recommendation objects
 */
const generateRecommendations = (user, latestVital, reports = []) => {
  const recommendations = [];

  // 1. Evaluate Vitals
  if (latestVital) {
    const { heartRate, systolic, diastolic, temperature, spo2, bloodSugar } = latestVital;

    // Blood Pressure evaluation
    if (systolic >= 140 || diastolic >= 90) {
      recommendations.push({
        id: 'bp_critical',
        category: 'Cardiovascular',
        title: 'Elevated Blood Pressure Detected',
        description: `Your blood pressure reading (${systolic}/${diastolic} mmHg) qualifies as Stage 2 Hypertension.`,
        priority: 'High',
        action: 'Rest for 10 minutes and re-measure. Avoid sodium, caffeine, and heavy physical activity today. Contact your physician if it remains high.'
      });
    } else if (systolic >= 130 || diastolic >= 80) {
      recommendations.push({
        id: 'bp_warning',
        category: 'Cardiovascular',
        title: 'Pre-hypertension Warning',
        description: `Your blood pressure reading (${systolic}/${diastolic} mmHg) is elevated above normal.`,
        priority: 'Medium',
        action: 'Monitor daily, limit dietary sodium, practice stress-reducing activities, and stay hydrated.'
      });
    } else if (systolic < 90 || diastolic < 60) {
      recommendations.push({
        id: 'bp_low',
        category: 'Cardiovascular',
        title: 'Low Blood Pressure (Hypotension)',
        description: `Your blood pressure reading (${systolic}/${diastolic} mmHg) is lower than normal.`,
        priority: 'Medium',
        action: 'Stand up slowly, increase fluid intake (electrolytes), and seek medical attention if you experience dizziness or fainting.'
      });
    }

    // Oxygen Levels (SpO2)
    if (spo2 < 95) {
      const risk = spo2 < 92 ? 'High' : 'Medium';
      recommendations.push({
        id: 'spo2_low',
        category: 'Respiratory',
        title: 'Low Blood Oxygen Saturation',
        description: `Your SpO2 is at ${spo2}%, which is below the normal physiological threshold (95-100%).`,
        priority: risk,
        action: risk === 'High' 
          ? 'Urgent: Seek emergency medical care or oxygen therapy immediately, especially if combined with shortness of breath.' 
          : 'Practice deep breathing, sit in an upright posture, ensure fresh air circulation, and check again in 15 minutes.'
      });
    }

    // Heart Rate
    if (heartRate > 100) {
      recommendations.push({
        id: 'hr_high',
        category: 'Cardiovascular',
        title: 'Elevated Heart Rate (Tachycardia)',
        description: `Your resting heart rate is ${heartRate} bpm.`,
        priority: 'Medium',
        action: 'Sit down, take slow deep breaths, drink a glass of water, and avoid stimulants (caffeine, nicotine).'
      });
    } else if (heartRate < 55 && !user.chronicConditions?.includes('Athletic training')) {
      recommendations.push({
        id: 'hr_low',
        category: 'Cardiovascular',
        title: 'Low Heart Rate (Bradycardia)',
        description: `Your heart rate is ${heartRate} bpm.`,
        priority: 'Medium',
        action: 'Ensure you are not feeling dizzy or fatigued. If accompanied by lethargy, consult your doctor.'
      });
    }

    // Body Temperature
    if (temperature > 38.5) {
      recommendations.push({
        id: 'temp_high',
        category: 'General Health',
        title: 'High Fever Detected',
        description: `Your body temperature is ${temperature}°C (${((temperature * 9/5) + 32).toFixed(1)}°F).`,
        priority: 'High',
        action: 'Stay cool and hydrated. You may take over-the-counter antipyretics (e.g. acetaminophen). Seek medical attention if fever exceeds 39°C or lasts more than 3 days.'
      });
    } else if (temperature > 37.5) {
      recommendations.push({
        id: 'temp_mild',
        category: 'General Health',
        title: 'Mild Fever / Elevated Temperature',
        description: `Your body temperature is ${temperature}°C.`,
        priority: 'Low',
        action: 'Get rest, stay hydrated, and monitor temperature every 4 hours.'
      });
    } else if (temperature < 35.5) {
      recommendations.push({
        id: 'temp_low',
        category: 'General Health',
        title: 'Hypothermia Warning',
        description: `Your body temperature is abnormally low at ${temperature}°C.`,
        priority: 'High',
        action: 'Wrap in warm blankets, consume warm liquids, and seek shelter/medical evaluation immediately.'
      });
    }

    // Blood Glucose
    if (bloodSugar) {
      if (bloodSugar > 180) {
        recommendations.push({
          id: 'sugar_critical',
          category: 'Endocrine',
          title: 'Critical Hyperglycemia Alert',
          description: `Your blood glucose is high at ${bloodSugar} mg/dL.`,
          priority: 'High',
          action: 'Avoid carbohydrates, drink plenty of water, check for urinary ketones if you have Type 1 Diabetes, and take insulin as prescribed by your endocrinologist.'
        });
      } else if (bloodSugar > 125) {
        recommendations.push({
          id: 'sugar_warning',
          category: 'Endocrine',
          title: 'Elevated Blood Glucose',
          description: `Your blood glucose is at ${bloodSugar} mg/dL, which is above optimal levels.`,
          priority: 'Medium',
          action: 'Follow a low glycemic index diet, engage in mild exercise (like walking), and check your fasting levels tomorrow morning.'
        });
      } else if (bloodSugar < 70) {
        recommendations.push({
          id: 'sugar_low',
          category: 'Endocrine',
          title: 'Hypoglycemia Alert (Low Blood Sugar)',
          description: `Your blood glucose is critically low at ${bloodSugar} mg/dL.`,
          priority: 'High',
          action: 'Rule of 15: Consume 15g of fast-acting sugar (half a cup of juice, 3-4 glucose tablets) and re-check blood glucose in 15 minutes.'
        });
      }
    }
  }

  // 2. Evaluate Chronic Conditions
  if (user && user.chronicConditions && user.chronicConditions.length > 0) {
    if (user.chronicConditions.includes('Hypertension')) {
      const hasBPAlerady = recommendations.some(r => r.id.startsWith('bp_'));
      if (!hasBPAlerady) {
        recommendations.push({
          id: 'chronic_htn',
          category: 'Chronic Care',
          title: 'Hypertension Management Protocol',
          description: 'Reminder for patients diagnosed with chronic hypertension.',
          priority: 'Low',
          action: 'Restrict daily sodium intake under 1500mg, log blood pressure twice daily, and do not skip prescribed antihypertensive therapies.'
        });
      }
    }

    if (user.chronicConditions.includes('Diabetes')) {
      const hasSugarAlready = recommendations.some(r => r.id.startsWith('sugar_'));
      if (!hasSugarAlready) {
        recommendations.push({
          id: 'chronic_dm',
          category: 'Chronic Care',
          title: 'Diabetes Maintenance',
          description: 'Support recommendations for diabetes care.',
          priority: 'Low',
          action: 'Ensure daily foot checks, test blood glucose before and after main meals, and maintain a balanced caloric distribution.'
        });
      }
    }
  }

  // 3. Evaluate Lab Reports
  if (reports && reports.length > 0) {
    const latestReport = reports[0];
    if (latestReport.parsedVitals) {
      const { hemoglobin, wbc, glucose, cholesterol } = latestReport.parsedVitals;

      if (hemoglobin !== null && hemoglobin < 12.0) {
        recommendations.push({
          id: 'report_hb_low',
          category: 'Lab Report',
          title: 'Low Hemoglobin (Possible Anemia)',
          description: `Your report shows Hemoglobin level of ${hemoglobin} g/dL (Normal: 12.0 - 17.5 g/dL).`,
          priority: 'Medium',
          action: 'Increase consumption of iron-rich foods (spinach, red meat, beans), take Vitamin C to aid absorption, and consult a doctor regarding iron supplements.'
        });
      }

      if (cholesterol !== null && cholesterol > 200) {
        recommendations.push({
          id: 'report_chol_high',
          category: 'Lab Report',
          title: 'High Total Cholesterol',
          description: `Your report indicates Total Cholesterol is ${cholesterol} mg/dL (Normal: < 200 mg/dL).`,
          priority: 'Medium',
          action: 'Limit saturated and trans fats, incorporate soluble fibers (oatmeal, brussels sprouts), and engage in regular cardiovascular exercise.'
        });
      }

      if (wbc !== null && wbc > 11000) {
        recommendations.push({
          id: 'report_wbc_high',
          category: 'Lab Report',
          title: 'Elevated White Blood Cell Count',
          description: `WBC is at ${wbc} /mcL (Normal: 4,500 - 11,000 /mcL).`,
          priority: 'Medium',
          action: 'An elevated WBC count often indicates active immune response or mild infection. Monitor for symptoms like fever or cough.'
        });
      }
    }
  }

  // Default recommendation if everything is perfect
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'general_well',
      category: 'Wellness',
      title: 'Vitals in Optimal Ranges',
      description: 'Your registered health indicators and lab reports are within standard, normal limits.',
      priority: 'Low',
      action: 'Keep up the healthy lifestyle! Ensure 7-8 hours of sleep, consume a balanced diet, and drink at least 2.5 liters of water daily.'
    });
  }

  return recommendations;
};

module.exports = {
  generateRecommendations
};
