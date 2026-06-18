import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Eye, EyeOff, AlertCircle, User, Mail, Phone, Calendar, Lock, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    bloodGroup: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.dob) {
      const dobDate = new Date(form.dob);
      if (isNaN(dobDate.getTime())) {
        setError("Please enter a valid Date of Birth.");
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dobDate > today) {
        setError("Date of Birth cannot be in the future.");
        return;
      }
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);
      if (dobDate < minDate) {
        setError("Date of Birth cannot be more than 120 years ago.");
        return;
      }
    }
    setLoading(true);
    const success = await register({ ...form, role: "patient" });
    setLoading(false);

    if (success) {
      navigate("/patient/dashboard");
    } else {
      setError("Registration failed. Email might already be in use.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200 group-hover:shadow-xl transition-all duration-300">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-2xl text-slate-800">MediCare</h1>
              <p className="text-xs text-teal-600 font-medium tracking-wide uppercase">Health Hub</p>
            </div>
          </Link>
          <p className="text-slate-600 text-sm">Create your patient account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-800">Patient Registration</CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              Fill in your details to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error &&
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            }
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    className="pl-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email *</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="pl-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Phone</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      placeholder="+1 555-0000"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      className="pl-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="dob" className="text-sm font-semibold text-slate-700">Date of Birth</Label>
                  <div className="relative">
                    <Input
                      id="dob"
                      type="date"
                      value={form.dob}
                      onChange={(e) => set("dob", e.target.value)}
                      className="pl-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="gender" className="text-sm font-semibold text-slate-700">Gender</Label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(e) => set("gender", e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-all"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="bloodGroup" className="text-sm font-semibold text-slate-700">Blood Group</Label>
                  <select
                    id="bloodGroup"
                    value={form.bloodGroup}
                    onChange={(e) => set("bloodGroup", e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-all"
                  >
                    <option value="">Select Blood Group</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                    <option>O+</option>
                    <option>O-</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-sm font-semibold text-slate-700">Address</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      placeholder="City, State, Country"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      className="pl-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className="pl-10 pr-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirm" className="text-sm font-semibold text-slate-700">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    className="pl-10 pr-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-lg shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
