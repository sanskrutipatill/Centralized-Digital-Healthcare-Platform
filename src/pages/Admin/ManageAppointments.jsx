import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/context/AuthContext";

const statusColor = {
  Scheduled: "bg-hospital-blue/10 text-hospital-blue border-hospital-blue/20",
  "Pending Approval": "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20",
  "Pending Payment": "bg-orange-100 text-orange-700 border-orange-200",
  Completed: "bg-hospital-green/10 text-hospital-green border-hospital-green/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
  "In Progress": "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20"
};

const mapBackendStatus = (status) => {
  if (status === 'PENDING' || status === 'pending') return 'Pending Approval';
  if (status === 'APPROVED_PENDING_PAYMENT') return 'Pending Payment';
  if (status === 'CONFIRMED' || status === 'confirmed' || status === 'APPROVED') return 'Scheduled';
  if (status === 'COMPLETED' || status === 'completed') return 'Completed';
  if (status === 'CANCELLED' || status === 'cancelled') return 'Cancelled';
  if (status === 'REJECTED' || status === 'rejected') return 'Rejected';
  return status;
};

const ManageAppointments = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      const formattedAppts = data.map(a => ({
        id: a._id,
        patientName: a.patient?.name || "Unknown Patient",
        doctorName: a.doctor?.name || "Unknown Doctor",
        department: a.department?.name || a.doctor?.department || "General",
        amount: a.fee || a.doctor?.consultationFee || 500,
        type: (a.type || "FIRST_VISIT").replace('_', ' '),
        date: new Date(a.date).toLocaleDateString(),
        time: a.timeSlot,
        status: mapBackendStatus(a.status),
      }));
      setAppointments(formattedAppts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAppointments();
  }, [user, toast]);

  const handleCancel = async (id) => {
    try {
      await appointmentService.updateAppointmentStatus(id, { status: "cancelled" });
      toast({ title: "Appointment Cancelled", description: "The appointment was successfully cancelled." });
      fetchAppointments();
    } catch (error) {
       toast({ 
         title: "Error", 
         description: error.response?.data?.message || "Failed to cancel appointment.", 
         variant: "destructive" 
       });
    }
  };

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Appointments</h1>
          <p className="text-muted-foreground text-sm mt-1">{appointments.length} total appointments</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search patient, doctor, department..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["All", "Pending Approval", "Pending Payment", "Scheduled", "Completed", "Cancelled", "Rejected"].map((f) =>
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground hover:border-primary/50"}`
                }>
                {f}
              </button>
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                 <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : filtered.length === 0 ? (
                 <div className="text-center p-10 text-muted-foreground bg-muted/20">No appointments found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Doctor</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date & Time</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((a) =>
                      <tr key={a.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{a.patientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.doctorName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.department}</td>
                        <td className="px-4 py-3 text-muted-foreground capitalize text-xs">
                           <Badge variant="outline" className={`${a.type === 'FOLLOW UP' ? 'text-blue-600 border-blue-200 bg-blue-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>{a.type}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" /> {a.date}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock className="w-3 h-3" /> {a.time}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">₹{a.amount}</td>
                        <td className="px-4 py-3">
                          <Badge className={`border text-xs ${statusColor[a.status] || statusColor['Scheduled']}`} variant="outline">{a.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {a.status === "Scheduled" || a.status === "Pending Approval" ?
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleCancel(a.id)}>
                              <X className="w-3 h-3 mr-1" /> Cancel
                            </Button> :
                            <span className="text-xs text-muted-foreground">—</span>
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManageAppointments;