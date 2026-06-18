import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Calendar, Loader2, Save, Heart, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Not Specified"];

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const PatientProfile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "Male",
    bloodGroup: "Not Specified",
    address: ""
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        dob: formatDateForInput(user.dob),
        gender: user.gender || "Male",
        bloodGroup: user.bloodGroup || "Not Specified",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (profile.dob) {
      const dobDate = new Date(profile.dob);
      if (isNaN(dobDate.getTime())) {
        toast({ title: "Validation Error", description: "Please enter a valid Date of Birth.", variant: "destructive" });
        setSaving(false);
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dobDate > today) {
        toast({ title: "Validation Error", description: "Date of Birth cannot be in the future.", variant: "destructive" });
        setSaving(false);
        return;
      }
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);
      if (dobDate < minDate) {
        toast({ title: "Validation Error", description: "Date of Birth cannot be more than 120 years ago.", variant: "destructive" });
        setSaving(false);
        return;
      }
    }

    try {
      await userService.updateUser(user.id, {
        name: profile.name,
        phone: profile.phone,
        dob: profile.dob === "" ? "" : profile.dob,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup === "Not Specified" ? "" : profile.bloodGroup,
        address: profile.address
      });

      await refreshUser();
      toast({
        title: "Profile Updated",
        description: "Your health profile details have been saved.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || error.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout role="patient">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Profile Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your demographics and health profile metadata</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <User className="w-5 h-5 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (Primary ID)</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-slate-50 border-slate-200 text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profile.dob}
                    onChange={(e) => setProfile(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={profile.gender}
                    onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <select
                    id="bloodGroup"
                    value={profile.bloodGroup}
                    onChange={(e) => setProfile(prev => ({ ...prev, bloodGroup: e.target.value }))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Residential Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street name, City, State, Country"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100 bg-teal-50/20">
            <CardContent className="p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-teal-800">Dynamic Demographics Sync</p>
                <p className="text-xs text-teal-700 mt-1">
                  Your dynamic age is automatically recalculated using your Date of Birth. Updates made here will sync instantly to all doctor prescriptions, scheduling sheets, and diagnosis reports.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="py-6 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default PatientProfile;
