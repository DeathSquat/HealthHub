import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { UploadReports } from "@/components/UploadReports";
import { AIAnalysis } from "@/components/AIAnalysis";
import { ScheduleAppointment } from "@/components/ScheduleAppointment";
import { MedicineReminder } from "@/components/MedicineReminder";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <Hero />
        <Features />
        <UploadReports />
        <AIAnalysis />
        <ScheduleAppointment />
        <MedicineReminder />
      </div>
    </div>
  );
};

export default Index;
