import { matchSymptomsToConditions, analyzeLabResults, medications } from './medicalData';

// Type for report analysis
type ReportAnalysis = {
  patientName: string | null;
  findings: string[];
  summary: string;
  recommendations: string[];
  tests: string[];
  medications: string[];
  doctorNotes: string[];
  conditions: Array<{
    name: string;
    confidence: number;
    matchedSymptoms: string[];
    tests: string[];
    treatments: string[];
    recommendations: string[];
  }>;
};

export type LocalAnalysis = Omit<ReportAnalysis, 'conditions'> & {
  conditions: Array<{
    name: string;
    confidence: number;
    matchedSymptoms: string[];
  }>;
};

function extractPatientName(text: string): string | null {
  const lines = text.split(/\r?\n/).slice(0, 20);
  const patterns = [
    /^\s*(patient|name|pt|mr\.?|mrs\.?|ms\.?|miss)\s*[\-:]\s*(.+)$/i,
    /(mr\.?|mrs\.?|ms\.?|miss|dr\.?)\s+[a-z][a-z\s']+/i,
    /patient\s+name[\s:]+([^\n]+)/i
  ];
  
  for (const pattern of patterns) {
    for (const line of lines) {
      const match = pattern.exec(line);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      } else if (match && match[0]) {
        return match[0].replace(/^(patient|name|pt|mr\.?|mrs\.?|ms\.?|miss|dr\.?)[\s:]+/i, '').trim();
      }
    }
  }
  return null;
}

function extractFindings(text: string): string[] {
  const findings: string[] = [];
  const sections = [
    { name: 'findings', regex: /(?:findings|observations?|results?)[\s\-:]+([\s\S]+?)(?=\n\s*\n|$)/i },
    { name: 'impression', regex: /(?:impression|conclusion|diagnosis)[\s\-:]+([\s\S]+?)(?=\n\s*\n|$)/i },
    { name: 'recommendation', regex: /(?:recommendations?|advice|plan)[\s\-:]+([\s\S]+?)(?=\n\s*\n|$)/i }
  ];

  for (const section of sections) {
    const match = section.regex.exec(text);
    if (match && match[1]) {
      const content = match[1]
        .split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 0 && !/^[\-*]\s*$/.test(line));
      findings.push(...content);
    }
  }

  // If no specific sections found, take first 10 non-empty lines as findings
  if (findings.length === 0) {
    return text
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 10);
  }

  return findings;
}

function extractTests(text: string): string[] {
  const tests = new Set<string>();
  const testPatterns = [
    /(?:test|exam|investigation)[\s\-:]+([^\n]+)/gi,
    /([A-Z][\w\s]+?)\s*[:=]\s*[\d\.\-<>]+/g,
    /([A-Z][\w\s]+?)\s*\([\w\s]+\)/g
  ];

  for (const pattern of testPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        const testName = match[1].trim();
        if (testName.length > 2 && !testName.match(/^(name|date|time|result|value|unit|reference|range)$/i)) {
          tests.add(testName);
        }
      } else if (match[0]) {
        tests.add(match[0].trim());
      }
    }
  }

  return Array.from(tests).slice(0, 10);
}

function extractMedications(text: string): string[] {
  const medications = new Set<string>();
  const medicationPatterns = [
    /(?:medication|prescription|drug|medicine)[\s\-:]+([\s\S]+?)(?=\n\s*\n|$)/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:tablet|capsule|injection|drops|ointment|cream|gel|syrup|suspension|inhaler|patch)\s*(?:\d+\s*(?:mg|mcg|g|ml|%|units?)?\s*[\/\-]?\s*\d*\s*(?:mg|mcg|g|ml|%|units?)?\s*(?:\w+\s*)*)?/gi,
    /(?:take|use|apply|inhale)\s+(?:\d+\s*[x\-]?\s*\d*\s*)?(?:tablets?|capsules?|puffs?|drops?|pumps?|applications?|patches?|injections?)?\s*(?:of\s*)?([\w\s]+?)(?:\s*\d|\s*mg|\s*mcg|\s*g|\s*ml|\s*%|\s*units?|\s*per|\s*in\s+the|\s*as\s+needed|\s*for|\s*with|$)/i
  ];

  for (const pattern of medicationPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        const med = match[1].trim();
        if (med.length > 2) {
          medications.add(med);
        }
      } else if (match[0]) {
        const med = match[0].replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '');
        if (med.length > 2) {
          medications.add(med);
        }
      }
    }
  }

  return Array.from(medications).slice(0, 10);
}

export function analyzeReportLocally(text: string): LocalAnalysis {
  // Extract patient name
  const patientName = extractPatientName(text);
  
  // Extract findings and observations
  const findings = extractFindings(text);
  
  // Extract test results
  const tests = extractTests(text);
  
  // Extract medications
  const medications = extractMedications(text);
  
  // Generate summary (first 200 chars of findings or text)
  const summary = findings.length > 0 
    ? findings.join(' ').substring(0, 200) + (findings.join(' ').length > 200 ? '...' : '')
    : text.substring(0, 200) + (text.length > 200 ? '...' : '');
  
  // Generate recommendations based on findings
  const recommendations: string[] = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('follow up') || lowerText.includes('follow-up')) {
    recommendations.push('Schedule a follow-up appointment as recommended');
  }
  
  if (medications.length > 0) {
    recommendations.push('Take medications as prescribed');
  }
  
  if (findings.some(f => f.toLowerCase().includes('abnormal'))) {
    recommendations.push('Consult with your healthcare provider about abnormal results');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Review the full report with your healthcare provider');
  }
  
  // Extract doctor's notes if any
  const doctorNotes: string[] = [];
  const notePatterns = [
    /(?:note|comment|remark)[\s\-:]+([^\n]+)/i,
    /(?:doctor|dr|physician)[\s\-:]+([^\n]+)/i
  ];
  
  for (const pattern of notePatterns) {
    const match = pattern.exec(text);
    if (match && match[1]) {
      doctorNotes.push(match[1].trim());
    }
  }

  // Match symptoms to conditions
  const conditions = matchSymptomsToConditions(findings);
  
  // Extract test results
  const testResults: string[] = [];
  const testPattern = /(\w[\w\s]+?)\s*[:=]?\s*([\d\.]+)\s*([a-zA-Z%]*)/g;
  let testMatch;
  
  while ((testMatch = testPattern.exec(text)) !== null) {
    const testName = testMatch[1].trim();
    const value = parseFloat(testMatch[2]);
    const unit = testMatch[3] || '';
    
    if (!isNaN(value)) {
      const result = analyzeLabResults(testName, value);
      testResults.push(`${testName}: ${value} ${unit} (${result.message})`);
    }
  }
  
  // Add any tests that weren't automatically detected
  tests.forEach(test => {
    if (!testResults.some(t => t.startsWith(test.split(':')[0]))) {
      testResults.push(`${test}: Not specified`);
    }
  });

  // Add medication details
  const detailedMedications = medications.map(med => {
    const medMatch = medications.find(m => 
      med.toLowerCase().includes(m.name.toLowerCase())
    );
    return medMatch 
      ? `${medMatch.name} (${medMatch.type}) - ${medMatch.use} - ${medMatch.dosage}`
      : med;
  });

  return {
    patientName: patientName || 'Patient',
    findings: findings.slice(0, 15), // Increased limit for better analysis
    summary: conditions.length > 0
      ? `Based on the symptoms and test results, potential conditions include: ${conditions.map(c => c.condition).join(', ')}. ${summary}`
      : summary,
    recommendations: [
      ...(conditions.flatMap(c => c.recommendations) || []),
      ...recommendations
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5), // Remove duplicates and limit to 5
    tests: testResults.length > 0 ? testResults : ['No specific test results mentioned'],
    medications: detailedMedications.length > 0 
      ? detailedMedications 
      : ['No specific medications mentioned'],
    doctorNotes: doctorNotes.length > 0 
      ? doctorNotes 
      : ['No additional notes from the doctor'],
    conditions: conditions.map(c => ({
      name: c.condition,
      confidence: c.confidence,
      matchedSymptoms: c.matchedSymptoms,
      tests: c.tests,
      treatments: c.treatments,
      recommendations: c.recommendations
    }))
  };
}


