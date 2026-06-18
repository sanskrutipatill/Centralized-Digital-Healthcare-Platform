import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, ChevronRight, Clock, Loader2, Building, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { departmentService } from "@/services/departmentService";
import { hospitalService } from "@/services/hospitalService";
import { userService } from "@/services/userService";
import { appointmentService } from "@/services/appointmentService";

const BookAppointment = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [selected, setSelected] = useState({
    departmentName: "",
    cityName: "",
    hospitalName: "",
    doctorId: "",
    date: "",
    time: "",
    reason: ""
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [patientAppointments, setPatientAppointments] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const allDoctors = await userService.getDoctors();
        // Remove duplicate doctors if any
        setDoctors(allDoctors);
        
        
        // Extract distinct departments as strings
        const distinctDepts = [...new Set(allDoctors.filter(d => d.department).map(d => d.department))];
        setDepartments(distinctDepts.map(d => ({ _id: d, name: d }))); // Mock _id as name for compatibility

        // Load patient appointments for Follow-up detection
        const userAppts = await appointmentService.getAppointments();
        setPatientAppointments(userAppts);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load booking data.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [toast]);

  // Utility to check if patient had completed an appointment with this doctor
  const isFollowUp = (doctorId) => {
    return patientAppointments.some(appt => 
      appt.doctor?._id === doctorId && 
      appt.rawStatus !== 'CANCELLED' && 
      appt.rawStatus !== 'REJECTED'
    );
  };

  // Calculate cities based on department
  useEffect(() => {
    if (!selected.departmentName) {
      setHospitals([]);
      setSelected(prev => ({ ...prev, cityName: "", hospitalName: "", doctorId: "" }));
      return;
    }
    
    // In our logic, 'hospitals' state will hold 'cities' data
    const cityList = [...new Set(doctors.filter(d => d.department === selected.departmentName && d.city).map(d => d.city))];
    setHospitals(cityList.map(c => ({ _id: c, name: c }))); // Mapping city to expected structure
    setSelected(prev => ({ ...prev, cityName: "", hospitalName: "", doctorId: "" }));
  }, [selected.departmentName, doctors]);

  // The doctors list to show in step 3
  const availableDoctors = doctors.filter(d => 
    d.department === selected.departmentName && 
    d.city === selected.cityName &&
    (selected.hospitalName ? d.hospital === selected.hospitalName : true)
  );

  const availableHospitals = [...new Set(doctors.filter(d => d.department === selected.departmentName && d.city === selected.cityName && d.hospital).map(d => d.hospital))];


  // Fetch available time slots when doctor or date changes
  const fetchAvailableSlots = useCallback(async () => {
    if (!selected.doctorId || !selected.date) {
      setAvailableSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSlotsError("");
    try {
      const slots = await appointmentService.getAvailableSlots(selected.doctorId, selected.date);
      setAvailableSlots(slots);
      // Clear selected time if it's not available anymore
      if (selected.time && !slots.includes(selected.time)) {
        setSelected(prev => ({ ...prev, time: "" }));
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setSlotsError("Failed to load available time slots. Please try again.");
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selected.doctorId, selected.date]);

  useEffect(() => {
    fetchAvailableSlots();
  }, [fetchAvailableSlots]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelected(prev => ({
      ...prev,
      date: newDate,
      time: "" // Reset time when date changes
    }));
  };

  const selectedDoctor = doctors.find((d) => d._id === selected.doctorId);

  const handleConfirm = async () => {
    setLoadingSubmit(true);
    try {
      await appointmentService.createAppointment({
        doctor: selected.doctorId,
        department: selected.departmentName,
        hospital: selectedDoctor.hospital || "",
        date: selected.date,
        timeSlot: selected.time,
        symptoms: selected.reason
      });

      toast({
        title: "Appointment Booked!",
        description: `Your appointment with ${selectedDoctor?.name} on ${selected.date} at ${selected.time} has been confirmed.`
      });
      setStep(5);
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || "There was an error booking your appointment.",
        variant: "destructive"
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
              step > s
                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-200"
                : step === s
                ? "bg-white border-2 border-teal-500 text-teal-600 shadow-md"
                : "bg-slate-100 text-slate-400 border-2 border-slate-200"
            }`}
          >
            {step > s ? <CheckCircle className="w-5 h-5" /> : s}
          </div>
          {s < 4 && (
            <div
              className={`h-1 w-12 sm:w-20 rounded transition-all duration-500 ${
                step > s ? "bg-gradient-to-r from-teal-400 to-teal-500" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const StepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                <Building className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Select Medical Department</h3>
                <p className="text-sm text-slate-500">Choose the department for your appointment</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((dept) => (
                <button
                  key={dept._id}
                  onClick={() =>
                    setSelected((p) => ({ ...p, departmentName: dept.name }))
                  }
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                    selected.departmentName === dept.name
                      ? "border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100 shadow-md"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{dept.name}</span>
                    {selected.departmentName === dept.name && (
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Select City</h3>
                <p className="text-sm text-slate-500">Choose a city for {selected.departmentName}</p>
              </div>
            </div>
            {hospitals.length === 0 ? (
              <div className="text-center py-12 border-2 border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-500">No cities available for this department.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {hospitals.map((hospital) => (
                  <button
                    key={hospital._id}
                    onClick={() =>
                      setSelected((p) => ({
                        ...p,
                        cityName: hospital.name
                      }))
                    }
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      selected.cityName === hospital.name
                        ? "border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100 shadow-md"
                        : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-lg shadow-sm">
                        C
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">{hospital.name}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                          Available clinics and doctors in {hospital.name}
                        </p>
                      </div>
                      {selected.cityName === hospital.name && (
                        <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Choose Your Doctor</h3>
                <p className="text-sm text-slate-500">
                  Select a specialist in {selected.cityName}
                </p>
              </div>
            </div>
            
            {availableHospitals.length > 0 && (
              <div className="mb-4">
                <Label className="text-sm font-semibold text-slate-700">Filter by Hospital (Optional)</Label>
                <select
                  className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  value={selected.hospitalName}
                  onChange={(e) => setSelected(p => ({...p, hospitalName: e.target.value}))}
                >
                  <option value="">All Hospitals</option>
                  {availableHospitals.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            )}

            {availableDoctors.length === 0 ? (
              <div className="text-center py-12 border-2 border-slate-200 rounded-xl bg-slate-50">
                <p className="text-slate-500">No doctors available in this city.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {availableDoctors.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => setSelected((p) => ({ ...p, doctorId: doc._id }))}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md ${
                      selected.doctorId === doc._id
                        ? "border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100 shadow-md"
                        : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center text-teal-700 font-bold text-lg shadow-sm shrink-0">
                        {doc.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-bold text-slate-800">{doc.name}</p>
                            <p className="text-sm text-teal-600 font-medium">
                              {doc.department || 'General Medicine'}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {doc.isVerified && (
                              <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">
                                Verified ✓
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                              {doc.hospital || doc.city || 'Location'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {doc.experience || 0} yrs exp.
                          </span>
                          {doc.qualifications && doc.qualifications.length > 0 && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {doc.qualifications.join(', ')}
                            </span>
                          )}
                          {doc.consultationFee && (
                            <span className="font-semibold text-teal-600 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              First Visit: ₹{doc.consultationFee}
                            </span>
                          )}
                          {doc.followUpFee && (
                            <span className="font-semibold text-teal-600 flex items-center gap-1">
                              Follow-up: ₹{doc.followUpFee}
                            </span>
                          )}
                        </div>

                        {isFollowUp(doc._id) && (
                          <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold">
                            This will be a Follow-up Visit (₹{doc.followUpFee})
                          </div>
                        )}

                        {doc.availability && doc.availability.length > 0 && (
                          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Available: {doc.availability.map(a => `${a.day.substring(0,3)} ${a.startTime}-${a.endTime}`).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Select Date & Time</h3>
                <p className="text-sm text-slate-500">Choose your preferred appointment slot</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Select Date</Label>
                <div className="relative">
                  <input
                    type="date"
                    value={selected.date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleDateChange}
                    className="flex h-12 w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">Select Time Slot</Label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8 border-2 border-slate-200 rounded-xl bg-slate-50">
                    <Loader2 className="w-6 h-6 animate-spin text-teal-600 mr-2" />
                    <span className="text-slate-600">Loading available slots...</span>
                  </div>
                ) : slotsError ? (
                  <div className="text-center py-8 border-2 border-red-200 rounded-xl bg-red-50">
                    <p className="text-red-600">{slotsError}</p>
                    <Button onClick={fetchAvailableSlots} variant="outline" size="sm" className="mt-2">
                      Retry
                    </Button>
                  </div>
                ) : selected.date && availableSlots.length === 0 ? (
                  <div className="text-center py-8 border-2 border-slate-200 rounded-xl bg-slate-50">
                    <p className="text-slate-500">
                      {selected.doctorId
                        ? "No available time slots for this date. Please select another date."
                        : "Please select a doctor first."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelected((p) => ({ ...p, time: slot }))}
                        className={`py-3 px-3 rounded-xl border-2 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
                          selected.time === slot
                            ? "border-teal-500 bg-gradient-to-r from-teal-50 to-teal-100 text-teal-700 shadow-md"
                            : "border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm"
                        }`}
                      >
                        <Clock className="w-4 h-4" />
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                <Label className="text-sm font-semibold text-slate-700">Reason for Visit (Optional)</Label>
                <Textarea
                  placeholder="Briefly describe your symptoms or reason for the appointment..."
                  value={selected.reason}
                  onChange={(e) => setSelected((p) => ({ ...p, reason: e.target.value }))}
                  className="min-h-[100px] border-2 border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 rounded-xl resize-none"
                  rows={3}
                />
              </div>

              {/* Summary & Confirm Button */}
              <Card className="bg-gradient-to-br from-slate-50 to-teal-50/30 border-2 border-teal-100 shadow-lg mt-6">
                <CardContent className="p-6">
                  <h4 className="font-bold text-slate-800 mb-4">Appointment Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Department</p>
                      <p className="font-semibold text-slate-800">{selected.departmentName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">City</p>
                      <p className="font-semibold text-slate-800">{selected.cityName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Doctor</p>
                      <p className="font-semibold text-slate-800">{selectedDoctor?.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Hospital</p>
                      <p className="font-semibold text-slate-800">{selectedDoctor?.hospital || 'General Clinic'}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Pricing Logic</p>
                      <p className="text-sm font-bold text-teal-600 font-mono text-xs">
                        {isFollowUp(selectedDoctor?._id) 
                          ? `Follow-up Visit: ₹${selectedDoctor?.followUpFee}` 
                          : `First Visit: ₹${selectedDoctor?.consultationFee}`
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500">Date</p>
                      <p className="font-semibold text-slate-800">{selected.date}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Time</p>
                      <p className="font-semibold text-slate-800">{selected.time || 'Not selected'}</p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <Button
                      onClick={handleConfirm}
                      disabled={loadingSubmit || !selected.doctorId || !selected.date || !selected.time}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingSubmit && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirm Appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <Card className="text-center p-10 bg-gradient-to-br from-teal-50 to-teal-100 border-2 border-teal-200 shadow-xl animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Appointment Confirmed!</h2>
            <p className="text-slate-600 mb-2 max-w-md mx-auto">
              Your appointment with <strong className="text-teal-700">{selectedDoctor?.name}</strong> has been successfully booked.
            </p>
            <p className="text-slate-600 mb-6">
              <span className="font-semibold">{selected.date}</span> at <span className="font-semibold">{selected.time}</span>
            </p>
            <div className="bg-white rounded-xl p-4 border border-teal-200 max-w-md mx-auto mb-6">
              <p className="text-sm text-slate-500 mb-1">Department</p>
              <p className="font-semibold text-teal-700">{selected.departmentName}</p>
              <p className="text-sm text-slate-500 mt-3 mb-1">City</p>
              <p className="font-semibold text-teal-700">{selected.cityName}</p>
              <p className="text-sm text-slate-500 mt-3 mb-1">Pricing Overview</p>
              <p className="text-lg font-bold text-teal-600">
                {isFollowUp(selectedDoctor?._id) 
                  ? `Follow-up Visit: ₹${selectedDoctor?.followUpFee}` 
                  : `First Visit: ₹${selectedDoctor?.consultationFee}`
                }
              </p>
            </div>
            <Button
              onClick={() => {
                setStep(1);
                setSelected({
                  departmentName: "",
                  cityName: "",
                  doctorId: "",
                  date: "",
                  time: "",
                  reason: ""
                });
              }}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-6 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Book Another Appointment
            </Button>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="patient">
        <div className="flex justify-center items-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-slate-500">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="patient">
      <div className="max-w-3xl mx-auto">
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6 border-b border-slate-100">
            <CardTitle className="text-2xl font-bold text-slate-800">
              Book an Appointment
            </CardTitle>
            {step < 5 && (
              <p className="text-slate-500 text-sm mt-1">Follow the steps to schedule your visit.</p>
            )}
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            {step < 5 && <StepIndicator />}
            <StepContent />
            {step < 5 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                {step > 1 ? (
                  <Button
                    variant="outline"
                    onClick={() => setStep((s) => s - 1)}
                    disabled={loadingSubmit}
                    className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 font-semibold py-6 px-6 rounded-xl"
                  >
                    Back
                  </Button>
                ) : (
                  <div></div> // Spacer for alignment when no back button
                )}
                {step < 4 && (
                  <Button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={
                      (step === 1 && !selected.departmentName) ||
                      (step === 2 && !selected.cityName) ||
                      (step === 3 && !selected.doctorId)
                    }
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-6 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookAppointment;
