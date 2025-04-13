import { useState } from "react";
import UserLayout from "@/components/layout/user-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import SubmissionTable from "@/components/submission-table";
import { Submission } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSignature, History, Loader2, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function SubmissionStatus() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/user"],
    retry: false
  });

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.id.toLowerCase().includes(searchQuery.toLowerCase());
    
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
    <UserLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary">Status Pengajuan</h1>
          <Link href="/user/submission/new">
            <Button className="bg-amber-500 hover:bg-amber-600">
              <FileSignature className="mr-2 h-4 w-4" /> Pengajuan Baru
            </Button>
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Riwayat Pengajuan</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue="all" 
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
                
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari pengajuan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
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
                    showUser={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Tidak Ada Pengajuan</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? "Tidak ada pengajuan yang sesuai dengan pencarian Anda" 
                        : "Anda belum memiliki pengajuan dengan status ini"}
                    </p>
                    <Link href="/user/submission/new">
                      <Button className="bg-amber-500 hover:bg-amber-600">
                        <FileSignature className="mr-2 h-4 w-4" /> Buat Pengajuan Baru
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
