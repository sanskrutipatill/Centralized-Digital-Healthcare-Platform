import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Upload, Loader2, User, Mail, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/services/appointmentService";
import { recordService } from "@/services/recordService";
import { useAuth } from "@/context/AuthContext";

const AddDiagnosis = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [form, setForm] = useState({
    patientId: "",
    symptoms: "",
    diagnosis: "",
    prescription: "",
    notes: ""
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await appointmentService.getAppointments();
        const uniquePatientsMap = new Map();

        data.forEach(a => {
           if (a.patient && a.patient._id && !uniquePatientsMap.has(a.patient._id)) {
             uniquePatientsMap.set(a.patient._id, {
                id: a.patient._id,
                name: a.patient.name,
                email: a.patient.email || 'N/A',
                phone: a.patient.phone || 'N/A',
                age: a.patient.age !== undefined && a.patient.age !== null ? a.patient.age : "N/A"
             });
           }
        });
        const patientsList = Array.from(uniquePatientsMap.values());
        setPatients(patientsList);

        // Check for patientId in URL params
        const patientIdFromUrl = searchParams.get('patientId');
        if (patientIdFromUrl && patientsList.find(p => p.id === patientIdFromUrl)) {
          setForm(prev => ({ ...prev, patientId: patientIdFromUrl }));
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load patients.",
          variant: "destructive"
        });
      } finally {
        setLoadingInitial(false);
      }
    };
    if (user) fetchPatients();
  }, [user, toast, searchParams]);

  // Update selected patient when patientId changes
  useEffect(() => {
    const patient = patients.find(p => p.id === form.patientId);
    setSelectedPatient(patient || null);
  }, [form.patientId, patients]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.diagnosis) {
      toast({ title: "Missing Fields", description: "Please fill patient and diagnosis.", variant: "destructive" });
      return;
    }

    setLoadingSubmit(true);
    try {
      const formData = new FormData();
      formData.append('patient', form.patientId);
      formData.append('date', new Date().toISOString());
      formData.append('symptoms', form.symptoms || '');
      formData.append('diagnosis', form.diagnosis);

      // The backend expects prescriptions to be an array of objects
      const prescriptionsArray = [{
        medicine: form.prescription || "None",
        dosage: "As Prescribed",
        duration: "Follow up"
      }];

      formData.append('prescriptions', JSON.stringify(prescriptionsArray));
      formData.append('notes', form.notes || '');
      
      if (file) {
        formData.append('reports', file);
      }

      await recordService.createRecord(formData);
      
      toast({ title: "Diagnosis Saved", description: "Medical record has been saved successfully." });
      setSubmitted(true);
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to save diagnosis.", 
        variant: "destructive" 
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingInitial) {
     return (
        <DashboardLayout role="doctor">
           <div className="flex justify-center items-center h-[50vh]">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        </DashboardLayout>
     );
  }

  if (submitted) {
    return (
      <DashboardLayout role="doctor">
        <div className="max-w-lg mx-auto">
          <Card className="text-center p-10">
            <div className="w-16 h-16 rounded-full bg-hospital-green/10 flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-8 h-8 text-hospital-green" />
            </div>
            <h2 className="text-xl font-bold mb-2">Diagnosis Saved!</h2>
            <p className="text-muted-foreground mb-6">The medical record has been saved to the patient's profile.</p>
            <Button onClick={() => {
              setSubmitted(false);
              setForm({ patientId: "", symptoms: "", diagnosis: "", prescription: "", notes: "" });
              setFile(null);
            }}>
              Add Another
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="doctor">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Add Diagnosis</h1>
          <p className="text-muted-foreground text-sm mt-1">Record patient diagnosis and prescription.</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Medical Record Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <select
                  value={form.patientId}
                  onChange={(e) => set("patientId", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select a patient...</option>
                  {patients.map((p) =>
                    <option key={p.id} value={p.id}>{p.name} (Age: {p.age})</option>
                  )}
                </select>
                {selectedPatient && (
                  <div className="mt-2 p-3 bg-muted/30 rounded-md border text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{selectedPatient.name}</span>
                      <span className="text-muted-foreground">• {selectedPatient.age} years, {selectedPatient.gender || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="text-xs">{selectedPatient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      <span className="text-xs">{selectedPatient.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Symptoms</Label>
                <Textarea placeholder="Describe patient symptoms..." value={form.symptoms} onChange={(e) => set("symptoms", e.target.value)} rows={2} />
              </div>

              <div className="space-y-2">
                <Label>Diagnosis *</Label>
                <Input placeholder="e.g. Hypertension Stage 1" value={form.diagnosis} onChange={(e) => set("diagnosis", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Prescription</Label>
                <Textarea placeholder="Medications and dosage..." value={form.prescription} onChange={(e) => set("prescription", e.target.value)} rows={2} />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea placeholder="Follow-up instructions, recommendations..." value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} />
              </div>

              <Label className="block mt-4">Test Reports (Optional)</Label>
              <div className="relative p-4 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary/50 transition-colors">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={(e) => setFile(e.target.files[0])}
                  accept="image/*,application/pdf"
                />
                <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-foreground">{file ? file.name : "Click to upload test reports"}</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>

              <Button type="submit" disabled={loadingSubmit} className="w-full">
                 {loadingSubmit && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                 Save Diagnosis
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddDiagnosis;