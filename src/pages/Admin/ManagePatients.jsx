import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, Edit2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

const ManagePatients = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const allUsers = await userService.getUsers();
        const patientUsers = allUsers.filter(u => u.role === "patient");

        const formatted = patientUsers.map(p => ({
          id: p._id,
          name: p.name,
          email: p.email,
          age: p.age !== undefined && p.age !== null ? p.age : "N/A",
          gender: p.gender || "Not Specified",
          bloodGroup: p.bloodGroup || "-",
          condition: p.symptoms || "General",
          lastVisit: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "Unknown"
        }));

        setPatients(formatted);
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not load patients list.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPatients();
  }, [user, toast]);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.condition.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Patients</h1>
            <p className="text-muted-foreground text-sm mt-1">{patients.length} patients registered</p>
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
                 <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : patients.length === 0 ? (
                 <div className="p-10 text-center text-muted-foreground bg-muted/20">No patients found.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Patient</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Age</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Gender</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Blood Group</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Condition</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Registered</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((p) =>
                      <tr key={p.id} className="hover:bg-muted/20">
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
                        <td className="px-4 py-3 text-sm capitalize">{p.gender}</td>
                        <td className="px-4 py-3"><Badge variant="outline" className="text-xs font-mono">{p.bloodGroup}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{p.condition}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.lastVisit}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-muted-foreground hover:text-foreground">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-destructive hover:bg-destructive/10" onClick={() => toast({ title: "Deletion Missing", description: "Admin delete endpoint not implemented.", variant: "destructive" })}>
                              <Trash2 className="w-3.5 h-3.5" />
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
    </DashboardLayout>
  );
};

export default ManagePatients;