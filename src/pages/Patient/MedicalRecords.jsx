import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, FlaskConical, Pill, Loader2 } from "lucide-react";
import { recordService } from "@/services/recordService";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const MedicalRecords = () => {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecords = async () => {
      if (!user) return;
      try {
        const userId = user._id || user.id; // handle varying token shapes
        const data = await recordService.getPatientRecords(userId);
        
        // Map backend schema to UI format
        const formatted = data.map(r => ({
          id: r._id,
          date: r.date ? new Date(r.date).toLocaleDateString() : 'Unknown Date',
          doctor: r.doctor?.name || 'Unknown Doctor',
          diagnosis: r.diagnosis || 'No Diagnosis',
          prescription: r.prescriptions?.map(p => `${p.medicine} (${p.dosage} for ${p.duration})`).join(', ') || 'None',
          tests: r.reports || [],
          notes: r.notes || "No additional notes available."
        }));

        setRecords(formatted);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load medical records.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [user, toast]);

  const filtered = records.filter((r) =>
    r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Medical Records</h1>
            <p className="text-muted-foreground text-sm mt-1">{records.length} records found</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search diagnosis or doctor..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
           <div className="flex justify-center items-center h-40">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No medical records found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((rec) =>
              <Card key={rec.id} className="card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{rec.diagnosis}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{rec.doctor} · {rec.date}</p>
                    </div>
                    <Button variant="outline" size="sm" className="flex-shrink-0">
                      <Download className="w-4 h-4 mr-1" /> Download
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Prescription</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.prescription}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <FlaskConical className="w-4 h-4 text-hospital-blue" />
                        <span className="text-sm font-medium">Reports / Tests</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {rec.tests.length > 0 ? rec.tests.map((t, i) => (
                           <Badge key={i} variant="secondary" className="text-xs">Report {i + 1}</Badge>
                        )) : <span className="text-sm text-muted-foreground">None</span>}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border">
                    <p className="text-sm font-medium mb-1">Doctor's Notes</p>
                    <p className="text-sm text-muted-foreground">{rec.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MedicalRecords;