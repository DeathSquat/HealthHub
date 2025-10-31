import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Stethoscope, User as UserIcon } from "lucide-react";
import { getOrCreateLocalUserId, setLocalRole } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const RoleSelect = () => {
  const navigate = useNavigate();

  const choose = async (role: "user" | "doctor") => {
    setLocalRole(role);
    // Persist to Supabase for analytics/reporting; works without auth using local id
    try {
      const localId = getOrCreateLocalUserId();
      await supabase.from("user_roles").insert({ local_user_id: localId, role });
    } catch (_e) {
      // ignore errors; local fallback already set
    }
    toast.success(`Role set to ${role}`);
    navigate(role === "user" ? "/user" : "/doctor");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient</CardTitle>
            <CardDescription>Use HealthHub as a patient</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => choose("user")}>
              <UserIcon className="mr-2" /> Continue as Patient
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doctor</CardTitle>
            <CardDescription>Use HealthHub as a doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => choose("doctor")}>
              <Stethoscope className="mr-2" /> Continue as Doctor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSelect;


