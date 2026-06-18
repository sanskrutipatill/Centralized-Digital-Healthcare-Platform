import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, X, Loader2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/services/appointmentService";
import { paymentService } from "@/services/paymentService";

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

const MyAppointments = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentProcessingId, setPaymentProcessingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments();
      const formattedData = data.map(a => ({
        id: a._id,
        doctorName: a.doctor?.name || 'Unknown Doctor',
        department: a.department?.name || 'General',
        date: new Date(a.date).toLocaleDateString(),
        time: a.timeSlot,
        status: mapBackendStatus(a.status),
        rawStatus: a.status,
        paymentStatus: a.paymentStatus,
        type: a.type || 'FIRST_VISIT',
        amount: a.amount || a.fee
      }));
      setAppointments(formattedData);
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
    fetchAppointments();
  }, [toast]);

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleCancel = async (id) => {
    try {
      await appointmentService.cancelAppointment(id);
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been successfully cancelled."
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error.response?.data?.message || "Failed to cancel appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePayment = async (appt) => {
    try {
      console.log("Payment Amount:", appt.amount);
      setPaymentProcessingId(appt.id);
      
      // Simulate network processing delay for a smooth demo feel
      setTimeout(async () => {
        try {
          await paymentService.demoPay(appt.id);
          setPaymentProcessingId(null);
          navigate('/payment-success', { state: { appt } });
        } catch (err) {
          toast({ title: "Demo Payment Failed", description: err.response?.data?.message || "Failed to confirm demo payment.", variant: "destructive" });
          setPaymentProcessingId(null);
        }
      }, 1500);

    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.message || "Could not initiate payment.", variant: "destructive" });
      setPaymentProcessingId(null);
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground text-sm mt-1">{appointments.length} total appointments</p>
          </div>
          <Button asChild>
            <a href="/patient/book-appointment">+ Book New</a>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search doctor or department..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                 <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Doctor</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Time</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.length === 0 ?
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No appointments found.</td>
                      </tr> :

                      filtered.map((appt) =>
                        <tr key={appt.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                                {appt.doctorName.split(" ").pop()?.charAt(0)}
                              </div>
                              <span className="font-medium">{appt.doctorName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{appt.department}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appt.date}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.time}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                  {appt.type === 'FOLLOW_UP' ? 'FOLLOW-UP' : 'FIRST VISIT'} <span className="text-teal-600">(₹{appt.amount})</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`border ${statusColor[appt.status] || statusColor['Scheduled']}`} variant="outline">
                                  {appt.status}
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {appt.status === "Pending Payment" ? (
                              <Button size="sm" disabled={paymentProcessingId === appt.id} className={`${appt.paymentStatus === 'FAILED' ? 'bg-destructive hover:bg-destructive/90' : 'bg-hospital-teal hover:bg-hospital-teal/90'} text-white shadow-sm disabled:opacity-70`} onClick={() => handlePayment(appt)}>
                                {paymentProcessingId === appt.id ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing</> : (appt.paymentStatus === 'FAILED' ? 'Retry Payment' : 'Pay Now')}
                              </Button>
                            ) : appt.status === "Scheduled" ? (
                              <span className="text-hospital-green font-medium flex items-center gap-1">Paid ✅</span>
                            ) : (appt.status === "Pending Approval") ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <X className="w-4 h-4 mr-1" /> Cancel
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will cancel your appointment with {appt.doctorName} on {appt.date}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancel(appt.id)} className="bg-destructive hover:bg-destructive/90">
                                      Cancel Appointment
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    }
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

export default MyAppointments;