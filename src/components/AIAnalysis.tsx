import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AIAnalysis = () => {
  const [reportText, setReportText] = useState("");
  const [analysis, setAnalysis] = useState("");
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

      setAnalysis(data.analysis);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze report");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold mb-4">AI-Powered Analysis</h2>
            <p className="text-muted-foreground text-lg">
              Get instant insights and personalized diet recommendations
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Report Details
                </CardTitle>
                <CardDescription>
                  Enter your medical report details or findings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter your medical report details here..."
                  className="min-h-[200px] mb-4"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2" />
                      Analyze Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft bg-gradient-card">
              <CardHeader>
                <CardTitle>Analysis & Recommendations</CardTitle>
                <CardDescription>
                  AI-generated insights from your report
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{analysis}</p>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Your AI analysis will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
