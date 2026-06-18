import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CheckCircle, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const statusColor = {
  Scheduled: "bg-hospital-blue/10 text-hospital-blue border-hospital-blue/20",
  Completed: "bg-hospital-green/10 text-hospital-green border-hospital-green/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "In Progress": "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20"
};

const mapBackendStatus = (status) => {
  if (status === 'PENDING') return 'Pending';
  if (status === 'APPROVED') return 'Approved';
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'CANCELLED') return 'Cancelled';
  if (status === 'REJECTED') return 'Rejected';
  return status;
};

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await appointmentService.getAppointments();
        
        const formattedAppts = data.map(a => ({
          id: a._id,
          patientName: a.patient?.name || "Unknown Patient",
          patientId: a.patient?._id,
          reason: a.symptoms || "Regular Checkup",
          time: a.timeSlot,
          date: new Date(a.date).toLocaleDateString(),
          status: mapBackendStatus(a.status),
          raw: a
        }));

        setAppointments(formattedAppts);

        // Derive unique patients from appointments
        const uniquePatientsMap = new Map();
        data.forEach(a => {
           if (a.patient && a.patient._id && !uniquePatientsMap.has(a.patient._id)) {
             uniquePatientsMap.set(a.patient._id, {
                id: a.patient._id,
                name: a.patient.name,
                condition: a.symptoms || "General",
                age: a.patient.age !== undefined && a.patient.age !== null ? a.patient.age : "N/A"
             });
           }
        });
        setPatients(Array.from(uniquePatientsMap.values()));

      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load dashboard data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchDashboardData();
  }, [user, toast]);

  const todayAppts = appointments.filter((a) => a.status === "Approved");
  const pendingRequests = appointments.filter((a) => a.status === "Pending");
  const completed = appointments.filter((a) => a.status === "Completed");

  const handleApprove = async (id) => {
    try {
      await appointmentService.approveAppointment(id);
      toast({ title: "Approved", description: "Appointment approved successfully." });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Approval failed.", variant: "destructive" });
    }
  };

  const handleReject = async (id) => {
    try {
      await appointmentService.rejectAppointment(id);
      toast({ title: "Rejected", description: "Appointment rejected successfully." });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejected' } : a));
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Rejection failed.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="doctor">
         <div className="flex justify-center items-center h-[50vh]">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your schedule and patients.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Approved Appointments", value: todayAppts.length, icon: Calendar, color: "text-hospital-blue", bg: "bg-hospital-blue/10" },
            { label: "Total Patients", value: patients.length, icon: Users, color: "text-primary", bg: "bg-primary/10" },
            { label: "Completed Visits", value: completed.length, icon: CheckCircle, color: "text-hospital-green", bg: "bg-hospital-green/10" },
            { label: "Pending Requests", value: pendingRequests.length, icon: Clock, color: "text-hospital-amber", bg: "bg-hospital-amber/10" }
          ].map(({ label, value, icon: Icon, color, bg }) =>
            <Card key={label}>
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Approved Appointments</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/doctor/schedule">View all <ChevronRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayAppts.length === 0 ? (
                   <p className="text-sm text-muted-foreground p-4 text-center">No approved appointments.</p>
                ) : todayAppts.slice(0, 4).map((appt) =>
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                         {appt.patientName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{appt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appt.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appt.date} - {appt.time}</p>
                      <Badge className={`text-xs border mt-1 bg-hospital-blue/10 text-hospital-blue`} variant="outline">{appt.status}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRequests.length === 0 ? (
                   <p className="text-sm text-muted-foreground p-4 text-center">No pending requests.</p>
                ) : pendingRequests.map((appt) =>
                  <div key={appt.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-muted/30 border border-border gap-4">
                    <div className="flex items-center gap-3 focus:outline-none w-full">
                      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-xs shrink-0">
                         {appt.patientName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{appt.patientName}</p>
                        <p className="text-xs text-muted-foreground">{appt.date} at {appt.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <Button size="sm" onClick={() => handleApprove(appt.id)} className="bg-hospital-green hover:bg-hospital-green/90 text-white">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(appt.id)} className="text-destructive border-destructive/50 hover:bg-destructive/10">Reject</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent Patients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {patients.length === 0 ? (
                 <p className="text-sm text-muted-foreground p-4 text-center">No patients found.</p>
              ) : patients.slice(0, 4).map((p) =>
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.condition}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{p.age}y</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;