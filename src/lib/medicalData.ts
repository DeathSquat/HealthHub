// Medical conditions and their associated information
export const medicalConditions = [
  {
    name: 'Hypertension',
    symptoms: ['high blood pressure', 'headache', 'dizziness', 'shortness of breath'],
    tests: ['Blood pressure measurement', 'Urine tests', 'Blood tests', 'Cholesterol test'],
    treatments: ['ACE inhibitors', 'Beta blockers', 'Diuretics', 'Calcium channel blockers'],
    recommendations: ['Reduce sodium intake', 'Exercise regularly', 'Maintain healthy weight', 'Limit alcohol']
  },
  {
    name: 'Diabetes Mellitus Type 2',
    symptoms: ['increased thirst', 'frequent urination', 'fatigue', 'blurred vision'],
    tests: ['Fasting blood sugar test', 'A1C test', 'Oral glucose tolerance test'],
    treatments: ['Metformin', 'Insulin therapy', 'SGLT2 inhibitors', 'GLP-1 receptor agonists'],
    recommendations: ['Monitor blood sugar', 'Healthy diet', 'Regular exercise', 'Foot care']
  },
  {
    name: 'Hypercholesterolemia',
    symptoms: ['Chest pain', 'Xanthomas', 'Coronary artery disease'],
    tests: ['Lipid panel', 'Cholesterol test', 'LDL test', 'HDL test'],
    treatments: ['Statins', 'Bile-acid-binding resins', 'Cholesterol absorption inhibitors'],
    recommendations: ['Low-fat diet', 'Regular exercise', 'Quit smoking', 'Maintain healthy weight']
  },
  {
    name: 'Hypothyroidism',
    symptoms: ['fatigue', 'weight gain', 'cold intolerance', 'constipation', 'dry skin'],
    tests: ['TSH test', 'T4 test', 'Thyroid antibody test'],
    treatments: ['Levothyroxine', 'Liothyronine', 'Natural desiccated thyroid'],
    recommendations: ['Take medication as prescribed', 'Regular check-ups', 'Balanced diet with iodine']
  },
  {
    name: 'Anemia',
    symptoms: ['fatigue', 'weakness', 'pale skin', 'shortness of breath', 'dizziness'],
    tests: ['Complete blood count (CBC)', 'Ferritin test', 'Vitamin B12 test', 'Iron studies'],
    treatments: ['Iron supplements', 'Vitamin B12 injections', 'Folic acid supplements'],
    recommendations: ['Iron-rich diet', 'Vitamin C with iron', 'Avoid tea/coffee with meals']
  }
];

// Common lab test reference ranges
export const labReferenceRanges = {
  'Fasting Blood Sugar': { min: 70, max: 99, unit: 'mg/dL' },
  'A1C': { min: 4, max: 5.6, unit: '%' },
  'Total Cholesterol': { min: 0, max: 199, unit: 'mg/dL' },
  'LDL': { min: 0, max: 99, unit: 'mg/dL' },
  'HDL': { min: 40, max: 60, unit: 'mg/dL' },
  'Triglycerides': { min: 0, max: 149, unit: 'mg/dL' },
  'TSH': { min: 0.4, max: 4.0, unit: 'mIU/L' },
  'Free T4': { min: 0.8, max: 1.8, unit: 'ng/dL' },
  'Hemoglobin': { male: { min: 13.5, max: 17.5 }, female: { min: 12.0, max: 15.5 }, unit: 'g/dL' },
  'Hematocrit': { male: { min: 38.8, max: 50 }, female: { min: 34.9, max: 44.5 }, unit: '%' },
  'WBC': { min: 4.5, max: 11.0, unit: 'x10^3/μL' },
  'Platelets': { min: 150, max: 450, unit: 'x10^3/μL' }
};

// Common medications and their details
export const medications = [
  { name: 'Metformin', type: 'Biguanide', use: 'Type 2 Diabetes', dosage: '500-2000mg daily' },
  { name: 'Lisinopril', type: 'ACE Inhibitor', use: 'Hypertension', dosage: '10-40mg daily' },
  { name: 'Atorvastatin', type: 'Statin', use: 'High Cholesterol', dosage: '10-80mg daily' },
  { name: 'Levothyroxine', type: 'Thyroid Hormone', use: 'Hypothyroidism', dosage: 'Varies by weight' },
  { name: 'Losartan', type: 'ARB', use: 'Hypertension', dosage: '25-100mg daily' },
  { name: 'Insulin Glargine', type: 'Long-acting Insulin', use: 'Diabetes', dosage: 'Varies by patient' },
  { name: 'Omeprazole', type: 'PPI', use: 'GERD', dosage: '20-40mg daily' },
  { name: 'Sertraline', type: 'SSRI', use: 'Depression/Anxiety', dosage: '25-200mg daily' },
  { name: 'Amlodipine', type: 'Calcium Channel Blocker', use: 'Hypertension', dosage: '2.5-10mg daily' },
  { name: 'Metoprolol', type: 'Beta Blocker', use: 'Hypertension/Heart Disease', dosage: '25-200mg daily' }
];

// Function to analyze lab results
export function analyzeLabResults(testName: string, value: number, gender: 'male' | 'female' = 'male') {
  const test = labReferenceRanges[testName as keyof typeof labReferenceRanges];
  if (!test) return { normal: false, message: 'Unknown test' };

  let range;
  if ('min' in test && 'max' in test) {
    range = test;
  } else if (gender in test) {
    range = test[gender as keyof typeof test];
  } else {
    return { normal: false, message: 'Invalid test configuration' };
  }

  if (value < range.min) {
    return { normal: false, message: `Low (below reference range of ${range.min}-${range.max} ${test.unit})` };
  } else if (value > range.max) {
    return { normal: false, message: `High (above reference range of ${range.min}-${range.max} ${test.unit})` };
  } else {
    return { normal: true, message: `Normal (${range.min}-${range.max} ${test.unit})` };
  }
}

// Function to match symptoms to conditions
export function matchSymptomsToConditions(symptoms: string[]) {
  const matchedConditions = [];
  const symptomText = symptoms.join(' ').toLowerCase();
  
  for (const condition of medicalConditions) {
    const matchedSymptoms = condition.symptoms.filter(symptom => 
      symptomText.includes(symptom.toLowerCase())
    );
    
    if (matchedSymptoms.length > 0) {
      matchedConditions.push({
        condition: condition.name,
        matchedSymptoms,
        confidence: Math.min(100, Math.round((matchedSymptoms.length / condition.symptoms.length) * 100)),
        tests: condition.tests,
        treatments: condition.treatments,
        recommendations: condition.recommendations
      });
    }
  }
  
  return matchedConditions.sort((a, b) => b.confidence - a.confidence);
}
