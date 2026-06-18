import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend } from
"recharts";

const monthlyPatients = [
{ month: "Jul", patients: 180 },
{ month: "Aug", patients: 210 },
{ month: "Sep", patients: 195 },
{ month: "Oct", patients: 240 },
{ month: "Nov", patients: 220 },
{ month: "Dec", patients: 260 },
{ month: "Jan", patients: 280 }];


const revenueData = [
{ month: "Jul", revenue: 18000 },
{ month: "Aug", revenue: 21500 },
{ month: "Sep", revenue: 20000 },
{ month: "Oct", revenue: 24500 },
{ month: "Nov", revenue: 22000 },
{ month: "Dec", revenue: 27000 },
{ month: "Jan", revenue: 28500 }];


const deptWorkload = [
{ dept: "Cardiology", patients: 340 },
{ dept: "Neurology", patients: 280 },
{ dept: "Orthopedics", patients: 220 },
{ dept: "Pediatrics", patients: 195 },
{ dept: "General", patients: 380 },
{ dept: "Dermatology", patients: 150 }];


const appointmentStatus = [
{ name: "Completed", value: 65, color: "hsl(145, 55%, 42%)" },
{ name: "Scheduled", value: 22, color: "hsl(210, 80%, 50%)" },
{ name: "Cancelled", value: 13, color: "hsl(0, 84%, 60%)" }];


const Reports = () => {
  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Hospital performance overview.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monthly Patient Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyPatients}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="hsl(180, 62%, 35%)" radius={[4, 4, 0, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Monthly Revenue (₹)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(145, 55%, 42%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Department Workload</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={deptWorkload} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="hsl(210, 80%, 50%)" radius={[0, 4, 4, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Appointment Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={appointmentStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value">
                    
                    {appointmentStatus.map((entry, index) =>
                    <Cell key={index} fill={entry.color} />
                    )}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, ""]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>);

};

export default Reports;