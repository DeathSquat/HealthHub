import { Navbar } from "@/components/Navbar";
import { UploadReports } from "@/components/UploadReports";
import { AIAnalysis } from "@/components/AIAnalysis";
import { MedicineReminder } from "@/components/MedicineReminder";

const UserPanel = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <UploadReports />
        <AIAnalysis />
        <MedicineReminder />
      </div>
    </div>
  );
};

export default UserPanel;


