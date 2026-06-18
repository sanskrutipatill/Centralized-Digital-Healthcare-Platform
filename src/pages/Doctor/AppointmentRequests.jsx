import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/context/AuthContext";

const statusColor = {
  PENDING: "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20",
};

const AppointmentRequests = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      const formattedAppts = data
        .filter((a) => a.status === "PENDING" || a.status === "pending")
        .map((a) => ({
          id: a._id,
          patientName: a.patient?.name || "Unknown Patient",
          reason: a.symptoms || "Regular Checkup",
          time: a.timeSlot,
          date: new Date(a.date).toLocaleDateString(),
          originalDate: new Date(a.date).toISOString().split("T")[0],
          status: "PENDING",
        }));
      setAppointments(formattedAppts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, toast]);

  const handleApprove = async (id) => {
    try {
      await appointmentService.approveAppointment(id);
      toast({ title: "Approved", description: "Appointment request approved." });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Approval Failed",
        description: error.response?.data?.message || "Could not approve appointment.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await appointmentService.rejectAppointment(id);
      toast({ title: "Rejected", description: "Appointment request rejected." });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Rejection Failed",
        description: error.response?.data?.message || "Could not reject appointment.",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Appointment Requests</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {appointments.length} pending requests
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-center text-muted-foreground p-10 bg-muted/20 rounded-lg">
              No pending appointment requests.
            </p>
          ) : (
            appointments.map((appt) => (
              <Card key={appt.id} className="card-hover transition-all">
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
                      <Badge
                        className={`border ${statusColor.PENDING}`}
                        variant="outline"
                      >
                        {appt.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleReject(appt.id)}
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 text-xs bg-hospital-blue hover:bg-hospital-blue/90 text-white"
                          onClick={() => handleApprove(appt.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AppointmentRequests;
