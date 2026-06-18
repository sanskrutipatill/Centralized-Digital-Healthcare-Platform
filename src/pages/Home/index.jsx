import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { doctors } from "@/utils/mockData";
import {
  Heart,
  Shield,
  Clock,
  Phone,
  Star,
  ChevronRight,
  Brain,
  Bone,
  Baby,
  Activity,
  Microscope,
  Users,
  Award,
  Building,
  Stethoscope,
} from "lucide-react";

const services = [
  {
    icon: Heart,
    label: "Cardiology",
    desc: "Heart care & diagnostics",
    color: "text-red-500",
  },
  {
    icon: Brain,
    label: "Neurology",
    desc: "Brain & nervous system",
    color: "text-purple-500",
  },
  {
    icon: Bone,
    label: "Orthopedics",
    desc: "Bones, joints & muscles",
    color: "text-amber-500",
  },
  {
    icon: Baby,
    label: "Pediatrics",
    desc: "Children's healthcare",
    color: "text-blue-500",
  },
  {
    icon: Activity,
    label: "General Medicine",
    desc: "Primary care services",
    color: "text-teal-500",
  },
  {
    icon: Microscope,
    label: "Pathology",
    desc: "Lab tests & reports",
    color: "text-green-500",
  },
];

const stats = [
  { icon: Users, label: "Patients Served", value: "50,000+" },
  { icon: Stethoscope, label: "Expert Doctors", value: "120+" },
  { icon: Building, label: "Departments", value: "25+" },
  { icon: Award, label: "Years of Excellence", value: "30+" },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-teal-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-bold text-xl text-slate-800 block leading-tight">
                  MediCare
                </span>
                <span className="text-xs text-teal-600 font-medium tracking-wide uppercase">
                  Health Hub
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-10">
              <a
                href="#services"
                className="text-slate-600 hover:text-teal-600 font-medium transition-all duration-200 relative group"
              >
                Services
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#doctors"
                className="text-slate-600 hover:text-teal-600 font-medium transition-all duration-200 relative group"
              >
                Doctors
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#about"
                className="text-slate-600 hover:text-teal-600 font-medium transition-all duration-200 relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a
                href="#contact"
                className="text-slate-600 hover:text-teal-600 font-medium transition-all duration-200 relative group"
              >
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 font-semibold transition-all duration-300"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-md shadow-teal-200 hover:shadow-lg hover:shadow-teal-300 transition-all duration-300 font-semibold"
                asChild
              >
                <Link to="/register">Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-blue-700 py-24 lg:py-32 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all px-4 py-2 text-sm font-medium">
                ★ Trusted Healthcare Provider
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
                Your Health,
                <br />
                Our Priority
              </h1>
              <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-lg">
                Experience world-class healthcare with seamless appointments,
                expert doctors, and comprehensive medical services — all
                designed around your wellbeing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-slate-50 shadow-lg hover:shadow-xl transition-all duration-300 font-bold px-8 py-6 rounded-xl"
                  asChild
                >
                  <Link to="/register">Book Appointment</Link>
                </Button>
                <Button
                  size="lg"
                  className="bg-white text-teal-700 hover:bg-slate-50 shadow-lg hover:shadow-xl transition-all duration-300 font-bold px-8 py-6 rounded-xl"
                  asChild
                >
                  <Link to="/login">Patient Login</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <div className="text-8xl text-white/30">
                    <Heart className="w-40 h-40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center group-hover:from-teal-100 group-hover:to-blue-100 transition-all duration-300 shadow-sm">
                  <stat.icon className="w-8 h-8 text-teal-600" />
                </div>
                <p className="text-4xl lg:text-5xl font-bold text-teal-600 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 scroll-mt-24">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors px-4 py-2 text-sm font-semibold">
              Our Services
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
              Comprehensive Healthcare
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              We provide a complete range of medical services to meet all your
              healthcare needs with compassion and excellence.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(({ icon: Icon, label, desc, color }) => (
              <Card
                key={label}
                className="group p-8 bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-slate-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center mb-6 group-hover:from-teal-100 group-hover:to-blue-100 transition-all duration-300 shadow-sm">
                  <Icon className={`w-8 h-8 ${color || "text-teal-600"}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {label}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">{desc}</p>
                <div className="flex items-center gap-2 text-teal-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section
        id="doctors"
        className="py-20 px-4 bg-gradient-to-b from-slate-50 to-teal-50/30 scroll-mt-24"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors px-4 py-2 text-sm font-semibold">
              Our Medical Team
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
              Meet Our Expert Doctors
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Our team of highly qualified specialists is dedicated to providing
              you with personalized, compassionate care.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {doctors.slice(0, 6).map((doc) => (
              <Card
                key={doc.id}
                className="p-6 bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-2xl border border-slate-100"
              >
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center text-teal-700 font-bold text-2xl mb-4 shadow-sm">
                    {doc.avatar}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-teal-600 font-medium mb-2">
                    {doc.specialization}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-700">
                        {doc.rating}
                      </span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm text-slate-500">
                      {doc.experience} yrs exp.
                    </span>
                  </div>
                  <Badge
                    variant={doc.available ? "default" : "secondary"}
                    className={
                      doc.available
                        ? "bg-green-100 text-green-700 hover:bg-green-200 border-0"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-0"
                    }
                  >
                    {doc.available ? "Available" : "Busy"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 font-semibold py-5 rounded-xl transition-all duration-300"
                  asChild
                >
                  <Link to={`/login?doctor=${doc.id}`}>View Profile</Link>
                </Button>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 font-semibold px-8 py-6 rounded-xl"
              asChild
            >
              <Link to="/login">
                View All Doctors <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features/About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors px-4 py-2 text-sm font-semibold">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-4 tracking-tight">
              Excellence in Healthcare
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Experience the difference with our patient-centered approach to
              medical care.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: Shield,
                title: "Secure & Private",
                desc: "Your health data is encrypted with bank-level security and completely confidential. We prioritize your privacy at every step.",
              },
              {
                icon: Clock,
                title: "24/7 Support",
                desc: "Our emergency services and dedicated support team are always available to assist you whenever you need us.",
              },
              {
                icon: Phone,
                title: "Easy Access",
                desc: "Book appointments, access records, and consult with doctors from any device, anywhere in the world.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-8 bg-gradient-to-br from-slate-50 to-teal-50/30 rounded-2xl hover:shadow-lg transition-all duration-300 border border-slate-100"
              >
                <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200">
                  <Icon className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  {title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of patients who trust MediCare for their healthcare
            needs. Create your account and schedule your first appointment
            today.
          </p>
          <Button
            size="lg"
            className="bg-white text-teal-700 hover:bg-slate-50 shadow-xl hover:shadow-2xl transition-all duration-300 font-bold px-10 py-7 text-lg rounded-xl"
            asChild
          >
            <Link to="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-slate-300 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">MediCare</h3>
                  <p className="text-xs text-teal-400 font-medium uppercase tracking-wide">
                    Health Hub
                  </p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md mb-6">
                Providing exceptional healthcare services with compassion and
                innovation. Your health is our priority, and we are committed to
                delivering the best medical care.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#services"
                    className="text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    Our Services
                  </a>
                </li>
                <li>
                  <a
                    href="#doctors"
                    className="text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    Our Doctors
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-slate-400 hover:text-teal-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400">info@medicare-hms.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-400">
                    123 Healthcare Ave, Medical City
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © 2025 MediCare Hospital Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#contact"
                className="text-slate-400 hover:text-teal-400 transition-colors text-sm"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
