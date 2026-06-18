import React from "react";
import { useLocation, Link, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const location = useLocation();
  const { appt } = location.state || {};

  if (!appt) {
    return <Navigate to="/patient/appointments" />;
  }

  return (
    <DashboardLayout role="patient">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-hospital-green/10 text-hospital-green rounded-full flex items-center justify-center mb-4 shadow-sm">
          <CheckCircle className="w-16 h-16" />
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800">Payment Successful</h1>
        <p className="text-muted-foreground max-w-md">
          Your payment has been successfully processed for this appointment. The doctor will be waiting for you.
        </p>

        <div className="bg-card border-2 border-slate-100 rounded-xl p-6 w-full max-w-md space-y-4 text-left my-6 shadow-md">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-muted-foreground">Doctor</span>
            <span className="font-semibold text-slate-800">{appt.doctorName}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-muted-foreground">Date & Time</span>
            <span className="font-semibold text-slate-800">{appt.date} at {appt.time}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-muted-foreground">Visit Type</span>
            <span className="font-semibold text-slate-800">
              {appt.type === 'FOLLOW_UP' ? 'Follow-up' : 'First Visit'}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-muted-foreground">Amount Paid</span>
            <span className="font-bold text-hospital-green text-lg">₹{appt.amount}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-xs text-slate-500 tracking-tight">DEMO_PAYMENT_ID</span>
          </div>
        </div>

        <Button asChild size="lg" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-md">
          <Link to="/patient/appointments">Go to My Appointments</Link>
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default PaymentSuccess;
