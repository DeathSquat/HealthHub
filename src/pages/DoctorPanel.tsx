import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ReportItem = {
  id: string;
  createdAt: string;
  patientName: string | null;
  doctor: string;
  problems: string[];
  analysis: string;
  excerpt: string;
};

const DoctorPanel = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hh_reports');
      const list: ReportItem[] = raw ? JSON.parse(raw) : [];
      setReports(list);
    } catch {
      setReports([]);
    }
  }, []);
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16 container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Doctor Dashboard</CardTitle>
            <CardDescription>
              {reports.length} report{reports.length !== 1 ? 's' : ''} awaiting review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <p className="text-muted-foreground">No reports yet. Ask patients to upload a report.</p>
            ) : (
              <div className="space-y-4">
                {reports.map((r) => (
                  <div key={r.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{r.patientName || 'Unknown Patient'}</p>
                        <p className="text-sm text-muted-foreground">Assigned: {r.doctor} • {new Date(r.createdAt).toLocaleString()}</p>
                        {r.problems.length ? (
                          <p className="text-sm mt-1">Problems: {r.problems.join(', ')}</p>
                        ) : null}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">View Analysis</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Report Analysis</DialogTitle>
                          </DialogHeader>
                          <pre className="whitespace-pre-wrap text-sm">{r.analysis}</pre>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DoctorPanel;


