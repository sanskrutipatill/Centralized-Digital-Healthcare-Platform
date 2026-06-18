import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, UserCog, Calendar, IndianRupee, TrendingUp, Activity, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { analyticsService } from "@/services/analyticsService";
import { appointmentService } from "@/services/appointmentService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const monthlyData = [
  { month: "Jul", patients: 180, revenue: 18000 },
  { month: "Aug",বিদ্যা: 210, revenue: 21500 }, // Typo fix: patients
  { month: "Sep", patients: 195, revenue: 20000 },
  { month: "Oct", patients: 240, revenue: 24500 },
  { month: "Nov", patients: 220, revenue: 22000 },
  { month: "Dec", patients: 260, revenue: 27000 },
  { month: "Jan", patients: 280, revenue: 28500 }
];

// Fixing the typo above in code
const chartData = [
  { month: "Jul", patients: 180, revenue: 18000 },
  { month: "Aug", patients: 210, revenue: 21500 },
  { month: "Sep", patients: 195, revenue: 20000 },
  { month: "Oct", patients: 240, revenue: 24500 },
  { month: "Nov", patients: 220, revenue: 22000 },
  { month: "Dec", patients: 260, revenue: 27000 },
  { month: "Jan", patients: 280, revenue: 28500 }
];

const statusColor = {
  Scheduled: "bg-hospital-blue/10 text-hospital-blue border-hospital-blue/20",
  Completed: "bg-hospital-green/10 text-hospital-green border-hospital-green/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "In Progress": "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20"
};

const mapBackendStatus = (status) => {
  if (status === 'pending' || status === 'confirmed') return 'Scheduled';
  if (status === 'completed') return 'Completed';
  if (status === 'cancelled') return 'Cancelled';
  return status;
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({ patientCount: 0, doctorCount: 0, appointmentCount: 0, revenue: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsData, apptData] = await Promise.all([
          analyticsService.getAnalytics(),
          appointmentService.getAppointments()
        ]);
        
        setStats({
          patientCount: analyticsData.patientCount || 0,
          doctorCount: analyticsData.doctorCount || 0,
          appointmentCount: analyticsData.appointmentCount || 0,
          revenue: analyticsData.revenue || 0
        });

        // Map fresh appointments
        const mappedAppts = apptData.map(a => ({
          id: a._id,
          patientName: a.patient?.name || 'Unknown Patient',
          doctorName: a.doctor?.name || 'Unknown Doctor',
          department: a.department?.name || 'General',
          date: new Date(a.date).toLocaleDateString(),
          status: mapBackendStatus(a.status)
        }));
        
        // Sort by date descending and get top 5
        setRecentAppointments(mappedAppts.reverse().slice(0, 5));

      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user, toast]);

  if (loading) {
    return (
      <DashboardLayout role="admin">
         <div className="flex justify-center items-center h-[50vh]">
           <Loader2 className="w-8 h-8 animate-spin text-primary" />
         </div>
      </DashboardLayout>
    )
  }

  // Find today's appointments out of total (simplistic approximation for dashboard)
  const todayAppts = recentAppointments.filter(a => a.date === new Date().toLocaleDateString()).length;

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Hospital operations overview.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Patients", value: stats.patientCount.toLocaleString(), icon: Users, color: "text-primary", bg: "bg-primary/10", link: "/admin/patients" },
            { label: "Total Doctors", value: stats.doctorCount.toLocaleString(), icon: UserCog, color: "text-hospital-blue", bg: "bg-hospital-blue/10", link: "/admin/doctors" },
            { label: "Total Appointments", value: stats.appointmentCount.toLocaleString(), icon: Calendar, color: "text-hospital-amber", bg: "bg-hospital-amber/10", link: "/admin/appointments" },
            { label: "Total Revenue", value: `₹${(stats.revenue / 1000).toFixed(1)}k`, icon: IndianRupee, color: "text-hospital-green", bg: "bg-hospital-green/10", link: "/admin/billing" }
          ].map(({ label, value, icon: Icon, color, bg, link }) =>
            <Link key={label} to={link}>
              <Card className="card-hover cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <TrendingUp className="w-4 h-4 text-hospital-green" />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Monthly Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="hsl(180, 62%, 35%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-hospital-green" /> Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(145, 55%, 42%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Appointments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/appointments">View all <ChevronRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {recentAppointments.length === 0 ? (
                 <p className="p-6 text-center text-muted-foreground">No recent appointments found.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Doctor</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Department</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentAppointments.map((a) =>
                      <tr key={a.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{a.patientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.doctorName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.department}</td>
                        <td className="px-4 py-3 text-muted-foreground">{a.date}</td>
                        <td className="px-4 py-3">
                          <Badge className={`border text-xs ${statusColor[a.status] || statusColor['Scheduled']}`} variant="outline">{a.status}</Badge>
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

export default AdminDashboard;