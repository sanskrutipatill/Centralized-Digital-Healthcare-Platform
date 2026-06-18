import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Public pages
import Home from "./pages/Home/index";
import Login from "./pages/Login/index";
import Register from "./pages/Register/index";
import NotFound from "./pages/NotFound";

// Patient pages
import PatientDashboard from "./pages/Patient/PatientDashboard";
import BookAppointment from "./pages/Patient/BookAppointment";
import MyAppointments from "./pages/Patient/MyAppointments";
import MedicalRecords from "./pages/Patient/MedicalRecords";
import Billing from "./pages/Patient/Billing";
import PaymentSuccess from "./pages/Patient/PaymentSuccess";
import PatientProfile from "./pages/Patient/PatientProfile";

// Doctor pages
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import AppointmentSchedule from "./pages/Doctor/AppointmentSchedule";
import AppointmentRequests from "./pages/Doctor/AppointmentRequests";
import PatientList from "./pages/Doctor/PatientList";
import AddDiagnosis from "./pages/Doctor/AddDiagnosis";
import DoctorProfile from "./pages/Doctor/DoctorProfile";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageDoctors from "./pages/Admin/ManageDoctors";
import ManagePatients from "./pages/Admin/ManagePatients";
import ManageAppointments from "./pages/Admin/ManageAppointments";
import BillingManagement from "./pages/Admin/BillingManagement";
import Reports from "./pages/Admin/Reports";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Home />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

const App = () =>
<QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Patient */}
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book-appointment" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<MyAppointments />} />
            <Route path="/patient/records" element={<MedicalRecords />} />
            <Route path="/patient/billing" element={<Billing />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<AppointmentSchedule />} />
            <Route path="/doctor/requests" element={<AppointmentRequests />} />
            <Route path="/doctor/patients" element={<PatientList />} />
            <Route path="/doctor/diagnosis" element={<AddDiagnosis />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctors />} />
            <Route path="/admin/patients" element={<ManagePatients />} />
            <Route path="/admin/appointments" element={<ManageAppointments />} />
            <Route path="/admin/billing" element={<BillingManagement />} />
            <Route path="/admin/reports" element={<Reports />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>;


export default App;