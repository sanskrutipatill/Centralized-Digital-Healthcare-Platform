import { Link, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  Users,
  UserCog,
  Stethoscope,
  ClipboardList,
  BarChart3,
  LogOut,
  Heart } from
"lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";





const patientLinks = [
{ to: "/patient/dashboard", icon: LayoutDashboard, label: "Dashboard" },
{ to: "/patient/book-appointment", icon: Calendar, label: "Book Appointment" },
{ to: "/patient/appointments", icon: ClipboardList, label: "My Appointments" },
{ to: "/patient/records", icon: FileText, label: "Medical Records" },
{ to: "/patient/billing", icon: CreditCard, label: "Billing" },
{ to: "/patient/profile", icon: UserCog, label: "Profile Settings" }];


const doctorLinks = [
{ to: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
{ to: "/doctor/requests", icon: ClipboardList, label: "Appointment Requests" },
{ to: "/doctor/schedule", icon: Calendar, label: "Appointment Schedule" },
{ to: "/doctor/patients", icon: Users, label: "Patient List" },
{ to: "/doctor/diagnosis", icon: Stethoscope, label: "Add Diagnosis" },
{ to: "/doctor/profile", icon: UserCog, label: "Profile Settings" }];


const adminLinks = [
{ to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
{ to: "/admin/doctors", icon: UserCog, label: "Manage Doctors" },
{ to: "/admin/patients", icon: Users, label: "Manage Patients" },
{ to: "/admin/appointments", icon: Calendar, label: "Appointments" },
{ to: "/admin/billing", icon: CreditCard, label: "Billing" },
{ to: "/admin/reports", icon: BarChart3, label: "Reports" }];


const roleLinks = {
  patient: patientLinks,
  doctor: doctorLinks,
  admin: adminLinks
};

const Sidebar = ({ role }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const links = roleLinks[role];

  return (
    <aside className="w-64 flex-shrink-0 sidebar-gradient flex flex-col h-full shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-base leading-tight">MediCare</p>
          <p className="text-white/60 text-xs capitalize">{role} Portal</p>
        </div>
      </div>

      {/* User */}
      <div className="px-6 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
            {user?.name?.charAt(0) ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/60 text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive ?
                "bg-white/20 text-white shadow-sm" :
                "text-white/75 hover:bg-white/10 hover:text-white"
              )}>
              
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>);

        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-all w-full">
          
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>);

};

export default Sidebar;