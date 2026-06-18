import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, MapPin, Calendar, Clock, Loader2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { doctorService } from "@/services/doctorService";
import { hospitalService } from "@/services/hospitalService";
import { departmentService } from "@/services/departmentService";

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorProfile = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [loadingRefs, setLoadingRefs] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    qualifications: [] as string[],
    experience: '',
    consultationFee: '',
    registrationNumber: '',
    isVerified: false,
    availability: [] as { day: string; startTime: string; endTime: string }[],
    department: null,
    hospital: null
  });

  const [newQualification, setNewQualification] = useState('');

  // State for hospitals and departments dropdowns
  const [hospitals, setHospitals] = useState([] as Array<{_id: string; name: string}>);
  const [departments, setDepartments] = useState([] as Array<{_id: string; name: string}>);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        specialization: user.specialization || '',
        qualifications: user.qualifications || [],
        experience: user.experience?.toString() || '',
        consultationFee: user.consultationFee?.toString() || '',
        registrationNumber: user.registrationNumber || '',
        isVerified: user.isVerified || false,
        availability: user.availability || [],
        department: user.department || null,
        hospital: user.hospital || null
      });

      // Set selected IDs from user's current affiliation
      setSelectedHospitalId(user.hospital?._id || '');
      setSelectedDepartmentId(user.department?._id || '');
    }
  }, [user]);

  // Fetch hospitals on mount
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const data = await hospitalService.getHospitals();
        setHospitals(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load hospitals.",
          variant: "destructive"
        });
      }
    };
    fetchHospitals();
  }, [toast]);

  // Fetch departments when selected hospital changes
  useEffect(() => {
    if (selectedHospitalId) {
      const fetchDepartments = async () => {
        try {
          setLoadingRefs(true);
          const data = await departmentService.getDepartmentsByHospital(selectedHospitalId);
          setDepartments(data);
          // Clear department selection if previously selected one is not in new list
          setSelectedDepartmentId(prev => {
            if (!data.find((d: { _id: string }) => d._id === prev)) return '';
            return prev;
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load departments.",
            variant: "destructive"
          });
        } finally {
          setLoadingRefs(false);
        }
      };
      fetchDepartments();
    } else {
      setDepartments([]);
      setSelectedDepartmentId('');
    }
  }, [selectedHospitalId, toast]);

  const handleAddQualification = () => {
    if (newQualification.trim() && !profile.qualifications.includes(newQualification.trim())) {
      setProfile(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification('');
    }
  };

  const handleRemoveQualification = (qual: string) => {
    setProfile(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qual)
    }));
  };

  const handleAvailabilityChange = (index: number, field: string, value: string) => {
    const newAvailability = [...profile.availability];
    newAvailability[index] = { ...newAvailability[index], [field]: value };
    setProfile(prev => ({ ...prev, availability: newAvailability }));
  };

  const handleAddAvailabilitySlot = () => {
    setProfile(prev => ({
      ...prev,
      availability: [...prev.availability, { day: 'Monday', startTime: '09:00', endTime: '17:00' }]
    }));
  };

  const handleRemoveAvailabilitySlot = (index: number) => {
    setProfile(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hospitalId = e.target.value;
    setSelectedHospitalId(hospitalId);
    setSelectedDepartmentId(''); // Reset department when hospital changes
  };

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartmentId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Update basic profile
      await doctorService.updateProfile({
        name: profile.name,
        phone: profile.phone,
        specialization: profile.specialization,
        experience: profile.experience ? Number(profile.experience) : undefined,
        consultationFee: profile.consultationFee ? Number(profile.consultationFee) : undefined,
        qualifications: profile.qualifications
      });

      // 2. Update affiliation (hospital, department, registration number)
      await doctorService.updateAffiliation({
        hospital: selectedHospitalId || undefined,
        department: selectedDepartmentId || undefined,
        registrationNumber: profile.registrationNumber || undefined
      });

      // 3. Update availability
      await doctorService.updateAvailability({
        availability: profile.availability
      });

      await refreshUser();
      toast({
        title: "Profile Updated",
        description: "All changes have been saved successfully.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || error.message || "Could not update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout role="doctor">
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Doctor Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your professional information and availability</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                Basic Information
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
                  <Label htmlFor="email">Email (Cannot be changed)</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-slate-50"
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
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={profile.specialization}
                    onChange={(e) => setProfile(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="e.g., Cardiologist"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={profile.experience}
                    onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consultationFee">Consultation Fee (₹)</Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="0"
                    value={profile.consultationFee}
                    onChange={(e) => setProfile(prev => ({ ...prev, consultationFee: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label> Qualifications </Label>
                <div className="flex gap-2">
                  <Input
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    placeholder="Add qualification (e.g., MD, DM, MBBS)"
                    onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddQualification(); }}}
                  />
                  <Button type="button" onClick={handleAddQualification} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.qualifications.map((qual, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {qual}
                      <button type="button" onClick={() => handleRemoveQualification(qual)} className="ml-1 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hospital & Department Info (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Hospital Affiliation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospital">Hospital</Label>
                  <select
                    id="hospital"
                    value={selectedHospitalId}
                    onChange={handleHospitalChange}
                    disabled={loadingRefs || hospitals.length === 0}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="">Select a hospital...</option>
                    {hospitals.map((hospital) => (
                      <option key={hospital._id} value={hospital._id}>
                        {hospital.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    value={selectedDepartmentId}
                    onChange={handleDepartmentChange}
                    disabled={loadingRefs || departments.length === 0}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  >
                    <option value="">Select a department...</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={profile.registrationNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="e.g., MTC-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Verification Status</Label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md border min-h-10">
                    {profile.isVerified ? (
                      <>
                        <Badge className="bg-green-100 text-green-700 border-0">Verified</Badge>
                        <span className="text-sm text-slate-500">✓ Credentials approved</span>
                      </>
                    ) : (
                      <>
                        <Badge variant="outline" className="text-amber-600 border-amber-300">Pending</Badge>
                        <span className="text-sm text-slate-500">Awaiting admin verification</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability Schedule */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Availability Schedule
                </CardTitle>
                <Button type="button" onClick={handleAddAvailabilitySlot} variant="outline" size="sm">
                  + Add Slots
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile.availability.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No availability slots defined. Add slots to receive bookings.</p>
              ) : (
                <div className="space-y-4">
                  {profile.availability.map((slot, index) => (
                    <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <select
                          value={slot.day}
                          onChange={(e) => handleAvailabilityChange(index, 'day', e.target.value)}
                          className="flex h-9 w-full sm:w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {days.map(day => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                          className="w-full sm:w-28"
                        />
                        <span className="text-slate-500">to</span>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                          className="w-full sm:w-28"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAvailabilitySlot(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-500 mt-3">
                <Calendar className="w-3 h-3 inline mr-1" />
                Your available time slots will be shown to patients when they book appointments.
              </p>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white py-6 px-8 rounded-xl">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DoctorProfile;
