import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { analyzeReportLocally } from "@/lib/analysis";
import Tesseract from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist";

export const UploadReports = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    // Plain text
    if (file.type.startsWith('text/')) {
      const text = await file.text();
      return text || '';
    }

    // PDF using pdfjs
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        // Set worker (CDN) for pdfjs in browser context
        // @ts-ignore
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.js';

        const arrayBuffer = await file.arrayBuffer();
        // @ts-ignore
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((it: any) => it.str).join(' ');
          fullText += strings + '\n';
        }
        return fullText.trim();
      } catch (e) {
        console.error('PDF OCR error:', e);
        toast.error('Could not read PDF. Please try another file or paste text.');
        return '';
      }
    }

    // Images via OCR
    if (file.type.startsWith('image/')) {
      try {
        const { data } = await Tesseract.recognize(file, 'eng');
        return (data.text || '').trim();
      } catch (e) {
        console.error('Image OCR error:', e);
        toast.error('Could not read image. Please try another file or paste text.');
        return '';
      }
    }

    toast.error('Unsupported file type. Please use PDF, image, or text file.');
    return '';
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        setUploading(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('analyze-report', {
          body: { reportText: text }
        });
        if (error) throw error;
        const rendered = String(data.analysis || '').trim();
        if (!rendered) throw new Error('No analysis generated');

        localStorage.setItem('hh_last_analysis', rendered);
        toast.success("Analysis complete! See AI Analysis section.");

        try {
          const reportsRaw = localStorage.getItem('hh_reports');
          const reports = reportsRaw ? JSON.parse(reportsRaw) : [];
          const newReport = {
            id: `${Date.now()}`,
            createdAt: new Date().toISOString(),
            patientName: null,
            doctor: 'Assigned by AI',
            problems: [],
            analysis: rendered,
            excerpt: text.slice(0, 500),
          };
          reports.unshift(newReport);
          localStorage.setItem('hh_reports', JSON.stringify(reports));
        } catch {}
      } catch (_e) {
        const local = analyzeReportLocally(text);
        const rendered = `${local.patientName ? `Patient: ${local.patientName}\n\n` : ''}` +
          `${local.findings.length ? `Findings:\n- ${local.findings.join("\n- ")}\n\n` : ''}` +
          `Summary: ${local.summary}\n\n` +
          `Tests Performed:\n- ${local.tests.join("\n- ")}\n\n` +
          `Medications:\n- ${local.medications.join("\n- ")}\n\n` +
          `Recommendations:\n- ${local.recommendations.join("\n- ")}`;
        localStorage.setItem('hh_last_analysis', rendered);
        toast.success("Analysis complete (offline dataset). See AI Analysis section.");

        try {
          const reportsRaw = localStorage.getItem('hh_reports');
          const reports = reportsRaw ? JSON.parse(reportsRaw) : [];
          const newReport = {
            id: `${Date.now()}`,
            createdAt: new Date().toISOString(),
            patientName: local.patientName || 'Patient',
            doctor: 'General Practitioner',
            problems: local.findings,
            analysis: rendered,
            excerpt: text.slice(0, 500),
            tests: local.tests,
            medications: local.medications,
            recommendations: local.recommendations
          };
          reports.unshift(newReport);
          localStorage.setItem('hh_reports', JSON.stringify(reports));
        } catch {}
      }

      setFile(null);
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to process report");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section id="upload" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-soft border-2">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Upload Medical Reports</CardTitle>
              <CardDescription className="text-base">
                Securely upload your medical reports for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept=".txt,.pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <FileText className="w-12 h-12 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {file ? file.name : "Click to select file"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, JPEG, PNG (Max 10MB)
                    </span>
                  </label>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleUpload}
                  disabled={!file || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Report"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
