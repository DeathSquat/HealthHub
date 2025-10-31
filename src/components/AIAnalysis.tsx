// Core Imports
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Sparkles, 
  ClipboardList, 
  Stethoscope, 
  Pill, 
  Activity, 
  AlertCircle, 
  FileText, 
  User, 
  HeartPulse, 
  AlertTriangle, 
  Thermometer, 
  CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { analyzeReportLocally } from '@/lib/analysis';
import { supabase } from '@/integrations/supabase/client';

interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const SectionCard = ({ title, icon: Icon, children }: SectionCardProps) => (
  <div className="bg-background border rounded-xl p-6 shadow-sm mb-6">
    <div className="flex items-center space-x-4 mb-4">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start">
    <span className="text-muted-foreground mr-2">{label}:</span>
    <span>{value}</span>
  </div>
);

const ResultItem = ({ icon: Icon, title, value }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string | string[] }) => (
  <div className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
    <Icon className="h-5 w-5 mt-0.5 text-yellow-500" />
    <div>
      <h4 className="font-medium">{title}</h4>
      <div className="text-sm text-muted-foreground">
        {Array.isArray(value) ? value.join(', ') : value}
      </div>
    </div>
  </div>
);

// Type Definitions
type Condition = {
  name: string;
  confidence: number;
  matchedSymptoms: string[];
  treatments?: string[];
};

type AnalysisResult = {
  patientName?: string;
  findings: string[];
  summary: string;
  recommendations: string[];
  tests: string[];
  medications: string[];
  doctorNotes: string[];
  conditions?: Condition[];
};

export const AIAnalysis = () => {
  const [reportText, setReportText] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | string>("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!reportText.trim()) {
      toast.error("Please enter report details");
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-report', {
        body: { reportText }
      });
      if (error) throw error;
      const rendered = String(data.analysis || '').trim();
      if (!rendered) throw new Error('No analysis generated');
      setAnalysis(rendered);
      localStorage.setItem('hh_last_analysis', rendered);
      toast.success("Analysis complete!");
    } catch (_e: any) {
      // Fallback to local analysis
      const local = analyzeReportLocally(reportText);
      setAnalysis({
        patientName: local.patientName || undefined,
        findings: local.findings,
        summary: local.summary,
        recommendations: local.recommendations,
        tests: local.tests,
        medications: local.medications,
        doctorNotes: local.doctorNotes,
        conditions: local.conditions?.map((c: Condition) => ({
          name: c.name,
          confidence: c.confidence,
          matchedSymptoms: Array.isArray(c.matchedSymptoms) ? c.matchedSymptoms : [],
          treatments: c.treatments || []
        }))
      });
      localStorage.setItem('hh_last_analysis', JSON.stringify(local));
      toast.success("Analysis complete (offline dataset)");
    } finally {
      setAnalyzing(false);
    }
  };

  // Load last analysis saved from file processing
  useEffect(() => {
    const last = localStorage.getItem('hh_last_analysis');
    if (last) {
      try {
        const parsed = JSON.parse(last);
        setAnalysis(parsed);
      } catch (e) {
        // If it's not valid JSON, treat it as plain text
        setAnalysis(last);
      }
    }
    
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'hh_last_analysis' && e.newValue) {
        try {
          setAnalysis(JSON.parse(e.newValue));
        } catch (e) {
          setAnalysis(e.newValue);
        }
      }
    };
    
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <section className="py-20 bg-background">
      {/* <div className="container mx-auto px-4"> */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">AI-Powered Medical Report Analysis</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your medical reports or paste the content below to get instant, detailed analysis and insights.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="report-text" className="block text-sm font-medium mb-2">
                <FileText className="inline mr-2 h-4 w-4" />
                Medical Report Content
              </label>
              <Textarea
                id="report-text"
                rows={8}
                placeholder="Paste your medical report text here..."
                className="min-h-[200px]"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
              />
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={handleAnalyze} 
                disabled={!reportText.trim() || analyzing}
                className="min-w-[200px]"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analyze Medical Report
                  </>
                )}
              </Button>
            </div>

            {typeof analysis === 'string' ? (
              <div className="mt-8 p-4 bg-muted/20 rounded-lg">
                <pre className="whitespace-pre-wrap">{analysis}</pre>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    <div className="border-b pb-4">
                      <h3 className="text-2xl font-bold flex items-center">
                        <ClipboardList className="h-6 w-6 mr-2 text-primary" />
                        Analysis Results
                      </h3>
                      <p className="text-muted-foreground">
                        Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Patient Information */}
                    <SectionCard 
                      icon={User} 
                      title="Patient Information"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoItem label="Name" value={analysis.patientName || 'Not specified'} />
                        <InfoItem label="Date of Birth" value={new Date().toLocaleDateString()} />
                      </div>
                    </SectionCard>

                    {/* Test Results */}
                    {analysis.tests && analysis.tests.length > 0 && (
                      <SectionCard title="Test Results" icon={Activity}>
                        <div className="space-y-4">
                          {analysis.tests.map((test, i) => {
                          const isNormal = !test.includes('High') && !test.includes('Low');
                          return (
                            <div key={i} className="flex items-start">
                              <div className={`p-1 rounded-full mr-3 mt-1 ${isNormal ? 'text-green-500' : 'text-amber-500'}`}>
                                {isNormal ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{test.split(':')[0]}</div>
                                <div className="text-sm text-muted-foreground">
                                  {test.split(':').slice(1).join(':').trim()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </SectionCard>
                  )}

                  {/* Medications */}
                  {analysis.medications && analysis.medications.length > 0 && !analysis.medications[0].includes('No specific') && (
                    <SectionCard title="Medications" icon={Pill}>
                      <div className="grid gap-3">
                        {analysis.medications.map((med, i) => (
                          <div key={i} className="p-3 bg-muted/10 rounded-lg">
                            <div className="font-medium">{med.split(' - ')[0]}</div>
                            {med.split(' - ').length > 1 && (
                              <div className="text-sm text-muted-foreground mt-1">
                                {med.split(' - ').slice(1).join(' • ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  )}

                  {/* Recommendations */}
                  {analysis.recommendations && analysis.recommendations.length > 0 && (
                    <SectionCard title="Recommendations" icon={Stethoscope}>
                      <ul className="space-y-3">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </SectionCard>
                  )}

                  {/* Raw Analysis */}
                  <SectionCard title="Full Report" icon={ClipboardList}>
                    <div className="bg-muted/20 p-4 rounded-lg overflow-auto max-h-96">
                      <pre className="whitespace-pre-wrap text-sm font-mono">
                        {JSON.stringify(analysis, null, 2)}
                      </pre>
                    </div>
                  </SectionCard>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-4 border-t">
                <p className="text-sm text-muted-foreground text-center w-full">
                  This analysis is for informational purposes only. Always consult with a healthcare professional for medical advice.
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};
