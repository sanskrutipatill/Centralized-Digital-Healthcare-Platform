import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import api from "@/services/api";
import { Calendar, FileText, CreditCard, Clock, ChevronRight, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (user?.id) {
      api.get("/appointments").then((res) => setAppointments(res.data)).catch(console.error);
      api.get(`/records/patient/${user.id}`).then((res) => setRecords(res.data)).catch(console.error);
      api.get("/bills").then((res) => setInvoices(res.data)).catch(console.error);
    }
  }, [user]);

  const myAppointments = appointments.map((a) => ({
    id: a._id,
    doctorName: a.doctor?.name || "Unknown",
    department: a.department?.name || "General",
    date: new Date(a.date).toLocaleDateString(),
    time: a.timeSlot,
    status: a.status === "pending" || a.status === "confirmed" ? "Scheduled" : a.status === "completed" ? "Completed" : "Cancelled"
  }));
  const upcoming = myAppointments.filter((a) => a.status === "Scheduled");
  const pending = invoices.filter((i) => i.status === "unpaid");

  const formattedRecords = medicalRecords.map((r) => ({
    id: r._id,
    patientId: r.patient,
    diagnosis: r.diagnosis,
    doctor: r.doctor?.name || "Dr. Staff",
    date: new Date(r.date).toLocaleDateString()
  }));

  const statusColor = {
    Scheduled: "bg-hospital-blue/10 text-hospital-blue border-hospital-blue/20",
    Completed: "bg-hospital-green/10 text-hospital-green border-hospital-green/20",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    "In Progress": "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20"
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0]}!</h1>
          <p className="text-muted-foreground text-sm mt-1">Here's your health summary for today.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
          { label: "Upcoming Appointments", value: upcoming.length, icon: Calendar, color: "text-hospital-blue", bg: "bg-hospital-blue/10", link: "/patient/appointments" },
          { label: "Total Visits", value: myAppointments.filter((a) => a.status === "Completed").length, icon: Activity, color: "text-hospital-green", bg: "bg-hospital-green/10", link: "/patient/appointments" },
          { label: "Medical Records", value: formattedRecords.length, icon: FileText, color: "text-primary", bg: "bg-primary/10", link: "/patient/records" },
          { label: "Pending Bills", value: pending.length, icon: CreditCard, color: "text-hospital-amber", bg: "bg-hospital-amber/10", link: "/patient/billing" }].
          map(({ label, value, icon: Icon, color, bg, link }) =>
          <Link key={label} to={link}>
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Upcoming Appointments</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/patient/appointments">View all <ChevronRight className="w-3 h-3 ml-1" /></Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcoming.length === 0 ?
                <p className="text-muted-foreground text-sm py-4 text-center">No upcoming appointments.</p> :

                upcoming.map((appt) =>
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                          {appt.doctorName.split(" ").slice(-1)[0].charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{appt.doctorName}</p>
                          <p className="text-xs text-muted-foreground">{appt.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{appt.date}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" /> {appt.time}
                        </p>
                      </div>
                      <Badge className={`text-xs border ${statusColor[appt.status]}`} variant="outline">
                        {appt.status}
                      </Badge>
                    </div>
                )
                }
                <Button className="w-full mt-2" asChild>
                  <Link to="/patient/book-appointment">+ Book New Appointment</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Records */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Records</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/patient/records">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {formattedRecords.slice(0, 3).map((rec) =>
              <div key={rec.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-sm font-medium truncate">{rec.diagnosis}</p>
                  <p className="text-xs text-muted-foreground mt-1">{rec.doctor}</p>
                  <p className="text-xs text-muted-foreground">{rec.date}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>);

};

export default PatientDashboard;