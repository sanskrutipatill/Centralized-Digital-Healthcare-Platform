import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Stethoscope, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/context/AuthContext";

const statusColor = {
  "Confirmed (Paid)": "bg-hospital-blue/10 text-hospital-blue border-hospital-blue/20",
  "Waiting for Payment": "bg-orange-100 text-orange-700 border-orange-200",
  Completed: "bg-hospital-green/10 text-hospital-green border-hospital-green/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "In Progress": "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20"
};

const mapBackendStatus = (status) => {
  if (status === 'APPROVED_PENDING_PAYMENT') return 'Waiting for Payment';
  if (status === 'CONFIRMED' || status === 'APPROVED' || status === 'confirmed') return 'Confirmed (Paid)';
  if (status === 'COMPLETED' || status === 'completed') return 'Completed';
  if (status === 'CANCELLED' || status === 'cancelled') return 'Cancelled';
  return status;
};

const AppointmentSchedule = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      const formattedAppts = data
        .filter(a => a.status === 'APPROVED_PENDING_PAYMENT' || a.status === 'CONFIRMED' || a.status === 'APPROVED' || a.status === 'COMPLETED' || a.status === 'confirmed' || a.status === 'completed')
        .map(a => ({
          id: a._id,
          patientName: a.patient?.name || "Unknown Patient",
          reason: a.symptoms || "Regular Checkup",
          time: a.timeSlot,
          date: new Date(a.date).toLocaleDateString(),
          originalDate: new Date(a.date).toISOString().split("T")[0],
          status: mapBackendStatus(a.status),
        }));
      setAppointments(formattedAppts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load schedule.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, toast]);

  const handleMarkComplete = async (id) => {
    try {
      await appointmentService.updateAppointmentStatus(id, { status: "COMPLETED" });
      toast({ title: "Appointment Completed", description: "Marked as completed successfully." });
      fetchAppointments();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Could not update status.", 
        variant: "destructive" 
      });
    }
  };

  const myAppts = appointments.filter((a) => a.originalDate === date);

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Appointment Schedule</h1>
            <p className="text-muted-foreground text-sm mt-1">{myAppts.length} appointments for selected date</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : myAppts.length === 0 ? (
             <p className="text-center text-muted-foreground p-10 bg-muted/20 rounded-lg">No appointments on this date.</p>
          ) : (
            myAppts.map((appt) =>
              <Card key={appt.id} className="card-hover">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {appt.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{appt.patientName}</p>
                        <p className="text-sm text-muted-foreground">{appt.reason}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" /> {appt.date} at {appt.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={`border ${statusColor[appt.status] || statusColor['Confirmed (Paid)']}`} variant="outline">{appt.status}</Badge>
                      {appt.status === "Confirmed (Paid)" &&
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-xs">
                            <Stethoscope className="w-3 h-3 mr-1" /> Start
                          </Button>
                          <Button size="sm" className="h-8 text-xs bg-hospital-green hover:bg-hospital-green/90 text-white" onClick={() => handleMarkComplete(appt.id)}>
                            <CheckCircle className="w-3 h-3 mr-1" /> Complete
                          </Button>
                        </div>
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentSchedule;