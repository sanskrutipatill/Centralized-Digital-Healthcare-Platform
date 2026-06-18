import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Eye, Loader2, UserRound, Phone, Mail, Calendar, FileText, Trash2, Plus, Stethoscope } from "lucide-react";
import { appointmentService } from "@/services/appointmentService";
import { doctorService } from "@/services/doctorService";
import { recordService } from "@/services/recordService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PatientList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Delete confirmation states
  const [deletePatientId, setDeletePatientId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await doctorService.getPatients();
        console.log('Fetched patients:', data); // Debug log
        // Transform to match table columns
        const transformed = data.map(p => ({
          id: p._id,
          name: p.name,
          email: p.email || 'N/A',
          phone: p.phone || 'N/A',
          gender: p.gender || 'Unknown',
          bloodGroup: p.bloodGroup || '-',
          age: p.age !== undefined && p.age !== null ? p.age : "N/A",
          lastVisit: p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'N/A',
          condition: p.condition || '-',
          totalVisits: p.totalVisits || 1
        }));
        setPatients(transformed);
      } catch (error) {
        console.error('Error fetching patients:', error);
        const errorMsg = error.response?.data?.message || error.message || "Failed to load patients list.";
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive"
        });
        // If unauthorized, redirect to login after a short delay
        if (error.response?.status === 401 || error.response?.status === 403) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchPatients();
    } else {
      setLoading(false);
    }
  }, [user, toast]);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.toLowerCase().includes(search.toLowerCase()) ||
    p.condition?.toLowerCase().includes(search.toLowerCase())
  );

  // Handler to view patient details
  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setIsDialogOpen(true);
    setLoadingRecords(true);
    try {
      const records = await recordService.getPatientRecords(patient.id);
      setPatientRecords(records);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load patient records.",
        variant: "destructive"
      });
    } finally {
      setLoadingRecords(false);
    }
  };

  // Handler to add diagnosis for a patient
  const handleAddDiagnosis = (patientId) => {
    navigate(`/doctor/diagnosis?patientId=${patientId}`);
  };

  // Handler to open delete confirmation
  const handleDeleteClick = (e, patientId) => {
    e.stopPropagation();
    setDeletePatientId(patientId);
    setIsDeleteDialogOpen(true);
  };

  // Handler to confirm delete
  const handleDeleteConfirm = async () => {
    if (!deletePatientId) return;
    setDeleting(true);
    try {
      const result = await doctorService.deletePatient(deletePatientId);
      toast({
        title: "Success",
        description: result.message || "Patient removed from your list.",
        variant: "default"
      });
      // Remove patient from local state
      setPatients(prev => prev.filter(p => p.id !== deletePatientId));
      setIsDeleteDialogOpen(false);
      setDeletePatientId(null);
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout role="doctor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Patient List</h1>
            <p className="text-muted-foreground text-sm mt-1">{patients.length} assigned patients</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search patients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
               {loading ? (
                 <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
               ) : patients.length === 0 ? (
                 <div className="p-10 text-center text-muted-foreground">No patients found.</div>
               ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Age</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gender</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Blood Group</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Condition</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Visit</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((p) =>
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{p.age}</td>
                        <td className="px-4 py-3">{p.gender}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs font-mono">{p.bloodGroup}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.condition}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.lastVisit}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleViewDetails(p)}>
                              <Eye className="w-3 h-3 mr-1" /> View
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleAddDiagnosis(p.id)}>
                              <Plus className="w-3 h-3 mr-1" /> Add Diagnosis
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={(e) => handleDeleteClick(e, p.id)}>
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
               )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserRound className="w-5 h-5" />
              Patient Details
            </DialogTitle>
          </DialogHeader>

          {selectedPatient && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{selectedPatient.name}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span>{selectedPatient.gender}</span>
                    <span>•</span>
                    <span>{selectedPatient.age} years</span>
                    {selectedPatient.bloodGroup && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs font-mono">{selectedPatient.bloodGroup}</Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedPatient.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Last visit: {selectedPatient.lastVisit}</span>
                    {selectedPatient.totalVisits && (
                      <Badge variant="secondary" className="ml-2">{selectedPatient.totalVisits} visit(s)</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Medical Records */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Medical History
                </h4>
                {loadingRecords ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : patientRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No medical records found.</p>
                ) : (
                  <div className="space-y-4">
                    {patientRecords.map((record, idx) => (
                      <Card key={record._id || idx}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-sm">{record.diagnosis}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(record.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {record.symptoms && (
                            <p className="text-sm mt-2"><span className="font-medium">Symptoms:</span> {record.symptoms}</p>
                          )}
                          {record.prescriptions && record.prescriptions.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Prescription:</p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {record.prescriptions.map((pres, i) => (
                                  <li key={i}>{pres.medicine} - {pres.dosage} for {pres.duration}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {record.notes && (
                            <p className="text-sm mt-2 text-muted-foreground"><span className="font-medium">Notes:</span> {record.notes}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <DialogFooter className="flex items-center justify-between sm:justify-between">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
                <Button onClick={() => { setIsDialogOpen(false); handleAddDiagnosis(selectedPatient.id); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Diagnosis
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Patient Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Patient</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this patient from your list? This will delete all appointments with this patient. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Remove Patient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default PatientList;