import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Reminder {
  id: string;
  medicine_name: string;
  time: string;
}

export const MedicineReminder = () => {
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminder, setNewReminder] = useState({
    medicineName: "",
    time: ""
  });

  useEffect(() => {
    fetchReminders();
    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medicine_reminders')
        .select('*')
        .eq('user_id', user.id)
        .order('time');

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Fetch reminders error:', error);
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    reminders.forEach(reminder => {
      if (reminder.time === currentTime) {
        toast.info(`Time to take ${reminder.medicine_name}!`, {
          duration: 10000,
        });
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Medicine Reminder', {
            body: `Time to take ${reminder.medicine_name}`,
            icon: '/favicon.ico'
          });
        }
      }
    });
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReminder.medicineName || !newReminder.time) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to set reminders");
        return;
      }

      const { error } = await supabase
        .from('medicine_reminders')
        .insert({
          user_id: user.id,
          medicine_name: newReminder.medicineName,
          time: newReminder.time
        });

      if (error) throw error;

      toast.success("Reminder added successfully!");
      setNewReminder({ medicineName: "", time: "" });
      fetchReminders();
      
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } catch (error) {
      console.error('Add reminder error:', error);
      toast.error("Failed to add reminder");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('medicine_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Reminder deleted");
      fetchReminders();
    } catch (error) {
      console.error('Delete reminder error:', error);
      toast.error("Failed to delete reminder");
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Medicine Reminders</h2>
            <p className="text-muted-foreground text-lg">
              Never miss your medication with smart reminders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Reminder
                </CardTitle>
                <CardDescription>
                  Set a time to be reminded to take your medicine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddReminder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicine">Medicine Name</Label>
                    <Input
                      id="medicine"
                      placeholder="Aspirin, Vitamin D..."
                      value={newReminder.medicineName}
                      onChange={(e) => setNewReminder({ ...newReminder, medicineName: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-time">Time</Label>
                    <Input
                      id="reminder-time"
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2" />
                        Add Reminder
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Your Reminders</CardTitle>
                <CardDescription>
                  {reminders.length} active reminder{reminders.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reminders.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No reminders set yet</p>
                    </div>
                  ) : (
                    reminders.map((reminder) => (
                      <div 
                        key={reminder.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{reminder.medicine_name}</p>
                          <p className="text-sm text-muted-foreground">{reminder.time}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteReminder(reminder.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
