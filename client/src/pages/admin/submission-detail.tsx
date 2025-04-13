import { useState } from "react";
import { useParams, useLocation } from "wouter";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Submission } from "@shared/schema";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import FileUpload from "@/components/file-upload";
import { Loader2, ArrowLeft, Download, FileText, Send, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function SubmissionDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [adminNotes, setAdminNotes] = useState("");
  const [adminFiles, setAdminFiles] = useState<File[]>([]);
  const [statusAction, setStatusAction] = useState<"processing" | "completed" | "rejected" | null>(null);
  const [activeTab, setActiveTab] = useState("detail");

  // Fetch submission data
  const { data: submission, isLoading } = useQuery<Submission>({
    queryKey: ["/api/submissions", id],
    queryFn: async () => {
      const res = await fetch(`/api/submissions/${id}`);
      if (!res.ok) {
        throw new Error("Gagal memuat data pengajuan");
      }
      return res.json();
    },
  });

  // File upload logic
  const [uploading, setUploading] = useState(false);
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Gagal mengunggah file");
      }
      
      const data = await response.json();
      return data.fileUrls;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  // Update submission status
  const updateSubmission = useMutation({
    mutationFn: async (data: { status: string; adminNotes?: string; adminFiles?: string[] }) => {
      const res = await apiRequest("PATCH", `/api/submissions/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Status pengajuan berhasil diperbarui",
        description: "Pembaruan status telah disimpan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = async (status: "processing" | "completed" | "rejected") => {
    setStatusAction(status);
    
    try {
      // Upload admin files if any
      let fileUrls: string[] = [];
      if (adminFiles.length > 0) {
        fileUrls = await uploadFiles(adminFiles);
      }
      
      await updateSubmission.mutateAsync({
        status,
        adminNotes: adminNotes || undefined,
        adminFiles: fileUrls.length > 0 ? fileUrls : undefined,
      });
      
      setStatusAction(null);
    } catch (error) {
      console.error("Error updating status:", error);
      setStatusAction(null);
    }
  };

  // Formatting functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy", { locale: id as any });
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "na":
        return "Surat Nikah (NA)";
      case "ktp":
        return "Pembaruan KTP";
      case "kk":
        return "Pembaruan KK";
      case "usaha":
        return "Keterangan Usaha";
      case "domisili":
        return "Keterangan Domisili";
      case "tidak_sengketa":
        return "Keterangan Tidak Bersengketa";
      case "pengantar":
        return "Surat Pengantar";
      case "lainnya":
        return "Layanan Lainnya";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Menunggu Review</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Dalam Proses</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Ditolak</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6 flex justify-center items-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout>
        <div className="p-6">
          <Button onClick={() => navigate("/admin/submissions")} variant="outline" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Pengajuan tidak ditemukan. Silakan kembali ke daftar pengajuan.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button onClick={() => navigate("/admin/submissions")} variant="outline" className="mr-3">
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
          <h1 className="text-2xl font-semibold text-primary flex items-center">
            Detail Pengajuan {submission.id}
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="detail">
              Detail Pengajuan
            </TabsTrigger>
            <TabsTrigger value="dokumen">
              Dokumen
            </TabsTrigger>
            <TabsTrigger value="tindakan">
              Tindakan Admin
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="detail">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Pengajuan</CardTitle>
                    <CardDescription>
                      Detail pengajuan dokumen {getDocumentTypeName(submission.type)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Nomor Pengajuan</h3>
                        <p className="font-medium">{submission.id}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</h3>
                        <p>{formatDate(submission.createdAt.toString())}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Jenis Dokumen</h3>
                        <p>{getDocumentTypeName(submission.type)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <div className="mt-1">{getStatusBadge(submission.status)}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Judul Pengajuan</h3>
                      <p>{submission.title}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Deskripsi</h3>
                      <div className="bg-muted/40 p-3 rounded-md">
                        <p className="whitespace-pre-line text-sm">{submission.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Pemohon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {submission.user ? (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(submission.user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{submission.user.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{submission.user.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {submission.user.nik && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">NIK</p>
                              <p className="text-sm">{submission.user.nik}</p>
                            </div>
                          )}
                          
                          {submission.user.phone && (
                            <div>
                              <p className="text-xs font-medium text-muted-foreground">Telepon</p>
                              <p className="text-sm">{submission.user.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">Data pemohon tidak tersedia</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Riwayat Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="h-9 w-9 flex items-center justify-center rounded-full bg-yellow-100 mr-3">
                          <AlertCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Menunggu Review</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(submission.createdAt.toString())}
                          </p>
                        </div>
                      </div>
                      
                      {submission.status !== "pending" && (
                        <div className="flex items-start">
                          <div className={`h-9 w-9 flex items-center justify-center rounded-full ${
                            submission.status === "rejected" 
                              ? "bg-red-100" 
                              : submission.status === "completed"
                                ? "bg-green-100"
                                : "bg-blue-100"
                          } mr-3`}>
                            {submission.status === "rejected" ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : submission.status === "completed" ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <Send className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {submission.status === "rejected" 
                                ? "Ditolak" 
                                : submission.status === "completed"
                                  ? "Selesai"
                                  : "Dalam Proses"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(submission.updatedAt.toString())}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dokumen">
            <Card>
              <CardHeader>
                <CardTitle>Dokumen Pengajuan</CardTitle>
                <CardDescription>
                  Dokumen yang diunggah oleh pemohon
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submission.documents && submission.documents.length > 0 ? (
                  <div className="space-y-2">
                    {submission.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <span className="text-sm">Document {index + 1}</span>
                        </div>
                        <a 
                          href={doc} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:text-primary/80 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" /> 
                          <span className="text-sm">Unduh</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Tidak ada dokumen yang diunggah</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {submission.adminFiles && submission.adminFiles.length > 0 && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Dokumen Admin</CardTitle>
                  <CardDescription>
                    Dokumen yang diunggah oleh admin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {submission.adminFiles.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/40 rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-primary mr-3" />
                          <span className="text-sm">Document Admin {index + 1}</span>
                        </div>
                        <a 
                          href={doc} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary hover:text-primary/80 flex items-center"
                        >
                          <Download className="h-4 w-4 mr-1" /> 
                          <span className="text-sm">Unduh</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="tindakan">
            <Card>
              <CardHeader>
                <CardTitle>Tindakan Admin</CardTitle>
                <CardDescription>
                  Tinjau dan perbarui status pengajuan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Catatan Admin</label>
                    <Textarea 
                      placeholder="Tambahkan catatan untuk pemohon (opsional)" 
                      className="min-h-32"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Unggah Dokumen Admin (Opsional)</label>
                    <FileUpload 
                      maxFiles={3} 
                      onFilesChange={setAdminFiles}
                      acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between flex-wrap gap-2">
                <div className="space-x-2">
                  <Button 
                    variant="destructive" 
                    disabled={
                      submission.status === "rejected" || 
                      statusAction !== null || 
                      updateSubmission.isPending
                    }
                    onClick={() => handleUpdateStatus("rejected")}
                  >
                    {statusAction === "rejected" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Tolak Pengajuan
                  </Button>
                  <Button 
                    variant="outline" 
                    disabled={
                      submission.status === "processing" || 
                      statusAction !== null || 
                      updateSubmission.isPending
                    }
                    onClick={() => handleUpdateStatus("processing")}
                  >
                    {statusAction === "processing" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Proses Pengajuan
                  </Button>
                </div>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={
                    submission.status === "completed" || 
                    statusAction !== null || 
                    updateSubmission.isPending
                  }
                  onClick={() => handleUpdateStatus("completed")}
                >
                  {statusAction === "completed" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Selesaikan Pengajuan
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}