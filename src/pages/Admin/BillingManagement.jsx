import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IndianRupee, CheckCircle, Clock, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { billingService } from "@/services/billingService";
import { useAuth } from "@/context/AuthContext";

const statusColor = {
  Paid: "bg-hospital-green/10 text-hospital-green border-hospital-green/20",
  Pending: "bg-hospital-amber/10 text-hospital-amber border-hospital-amber/20",
  Overdue: "bg-destructive/10 text-destructive border-destructive/20"
};

const BillingManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await billingService.getBills();
        const formatted = data.map(b => ({
          id: b._id,
          date: new Date(b.issuedDate || b.createdAt).toLocaleDateString(),
          amount: b.total || b.amount,
          status: b.status === "paid" ? "Paid" : "Pending",
          patientName: b.patient?.name || "Unknown Patient",
          services: ["Consultation", "Hospital Charges"] // default mock since backend lacks granular service strings
        }));
        setInvoices(formatted);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load invoices.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchInvoices();
  }, [user, toast]);

  const total = invoices.reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const pending = invoices.filter((i) => i.status === "Pending").reduce((s, i) => s + i.amount, 0);

  const handleGenerateInvoice = () => {
    toast({ 
      title: "Feature Missing", 
      description: "Admin generation form/endpoint not fully implemented natively.",
      variant: "default"
    });
  };

  const handleMarkPaid = () => {
    // Note: No backend endpoints currently support PATCHing a bill status from 'unpaid' to 'paid'.
    toast({ 
      title: "Update Endpoint Missing", 
      description: "No backend support for marking bills as paid exists yet. (Expected PATCH /api/bills/:id)",
      variant: "destructive"
    });
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all hospital invoices and payments.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Billed", value: `₹${total}`, icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
            { label: "Collected", value: `₹${paid}`, icon: CheckCircle, color: "text-hospital-green", bg: "bg-hospital-green/10" },
            { label: "Outstanding", value: `₹${pending}`, icon: Clock, color: "text-hospital-amber", bg: "bg-hospital-amber/10" }
          ].map(({ label, value, icon: Icon, color, bg }) =>
            <Card key={label}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">All Invoices</CardTitle>
            <Button size="sm" onClick={handleGenerateInvoice}>
              <FileText className="w-4 h-4 mr-2" /> Generate Invoice
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : invoices.length === 0 ? (
                <div className="text-center p-10 text-muted-foreground bg-muted/20">No invoices found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Invoice ID</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Services</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoices.map((inv) =>
                      <tr key={inv.id} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-mono text-xs font-medium" title={inv.id}>{inv.id.slice(-6).toUpperCase()}</td>
                        <td className="px-4 py-3 font-medium">{inv.patientName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{inv.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {inv.services.map((s) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">₹{inv.amount}</td>
                        <td className="px-4 py-3">
                          <Badge className={`border text-xs ${statusColor[inv.status] || statusColor['Pending']}`} variant="outline">{inv.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {inv.status === "Pending" ?
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleMarkPaid}>
                              Mark Paid
                            </Button> :
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">View</Button>
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

export default BillingManagement;