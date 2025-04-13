import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import SubmissionTable from "@/components/submission-table";
import { Submission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Filter, Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminSubmissions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [location] = useLocation();
  
  // Get status from URL if present
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const urlStatus = urlParams.get('status');
  
  // Use URL status parameter if available
  useState(() => {
    if (urlStatus && ["all", "pending", "processing", "completed", "rejected"].includes(urlStatus)) {
      setStatusFilter(urlStatus);
    }
  });
  
  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    retry: false
  });

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (submission.user?.fullName || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "pending" && submission.status === "pending") ||
      (statusFilter === "processing" && submission.status === "processing") ||
      (statusFilter === "completed" && submission.status === "completed") ||
      (statusFilter === "rejected" && submission.status === "rejected");
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusCounts = () => {
    if (!submissions) return { all: 0, pending: 0, processing: 0, completed: 0, rejected: 0 };
    
    return {
      all: submissions.length,
      pending: submissions.filter(s => s.status === "pending").length,
      processing: submissions.filter(s => s.status === "processing").length,
      completed: submissions.filter(s => s.status === "completed").length,
      rejected: submissions.filter(s => s.status === "rejected").length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary">Manajemen Pengajuan</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Daftar Pengajuan</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue={statusFilter} 
              value={statusFilter}
              onValueChange={setStatusFilter}
              className="w-full"
            >
              <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-4">
                <TabsList>
                  <TabsTrigger value="all">
                    Semua
                    <Badge variant="secondary" className="ml-2">{statusCounts.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Menunggu
                    <Badge variant="secondary" className="ml-2">{statusCounts.pending}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="processing">
                    Diproses
                    <Badge variant="secondary" className="ml-2">{statusCounts.processing}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Selesai
                    <Badge variant="secondary" className="ml-2">{statusCounts.completed}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="rejected">
                    Ditolak
                    <Badge variant="secondary" className="ml-2">{statusCounts.rejected}</Badge>
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari pengajuan..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <TabsContent value={statusFilter} className="mt-0">
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredSubmissions.length > 0 ? (
                  <SubmissionTable 
                    submissions={filteredSubmissions} 
                    showUser={true}
                    isAdmin={true}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Tidak Ada Pengajuan</h3>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "Tidak ada pengajuan yang sesuai dengan pencarian Anda" 
                        : "Belum ada pengajuan dengan status ini"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
