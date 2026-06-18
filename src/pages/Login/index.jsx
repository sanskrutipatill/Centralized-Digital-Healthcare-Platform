import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart, Eye, EyeOff, AlertCircle, User, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const roleRedirects = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard"
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    const userRole = await login(email, password);
    setLoading(false);
    if (userRole) {
      navigate(roleRedirects[userRole]);
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const demoCredentials = [
    { role: "patient", email: "patient@hms.com" },
    { role: "doctor", email: "amit.deshmukh@hms.com" },
    { role: "doctor", email: "sneha.kulkarni@hms.com" },
    { role: "doctor", email: "rahul.patil@hms.com" },
    { role: "admin", email: "admin@hms.com" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
          <p className="text-slate-600 text-sm">Sign in to your account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm rounded-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-800">Welcome back</CardTitle>
            <CardDescription className="text-slate-500 mt-2">
              Enter your credentials to access your dashboard
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
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-10 py-6 rounded-xl border-slate-200 focus:border-teal-500 focus:ring-teal-500 transition-all"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</Label>
                  <a href="#" className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors">Forgot password?</a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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

              <Button
                type="submit"
                className="w-full py-6 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-bold text-lg shadow-lg shadow-teal-200 hover:shadow-xl hover:shadow-teal-300 transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-600 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-teal-600 hover:text-teal-700 font-bold transition-colors">Create account</Link>
            </p>

            {/* Demo Hints */}
            <div className="mt-8 p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-100">
              <p className="text-xs font-bold text-teal-700 mb-3 flex items-center gap-2">
                <span className="text-lg">💡</span> Demo credentials
              </p>
              <div className="space-y-2">
                {demoCredentials.map(({ role: r, email: e }) =>
                  <button
                    key={e}
                    type="button"
                    onClick={() => { setEmail(e); setPassword("demo123"); }}
                    className="block w-full text-left text-xs text-slate-600 hover:text-teal-700 px-3 py-2 rounded-lg hover:bg-white transition-all duration-200 flex items-center justify-between group"
                  >
                    <span className="capitalize font-medium">{r}</span>
                    <span className="text-slate-500 group-hover:text-teal-600">{e}</span>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-3 italic">Password: <span className="font-mono font-semibold text-teal-600">demo123</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
