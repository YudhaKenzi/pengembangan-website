import AdminLayout from "@/components/layout/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Submission } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SubmissionTable from "@/components/submission-table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowUpRight, CheckCircle, ClipboardList, Clock, Loader2, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    retry: false,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
    retry: false,
  });

  const getStatusCounts = () => {
    if (!submissions) return { total: 0, pending: 0, processing: 0, completed: 0 };
    
    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === "pending").length,
      processing: submissions.filter(s => s.status === "processing").length,
      completed: submissions.filter(s => s.status === "completed").length,
    };
  };

  const statusCounts = getStatusCounts();
  const latestSubmissions = submissions?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-primary mb-6">Dashboard Admin</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-start">
              <div className="p-3 rounded-full bg-primary/10 mr-4">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pengajuan</p>
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-muted rounded mt-1"></div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.total}</p>
                    <p className="text-xs text-green-600 mt-1">↑ 12% dari bulan lalu</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-start">
              <div className="p-3 rounded-full bg-yellow-100 mr-4">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Menunggu Proses</p>
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-muted rounded mt-1"></div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.pending}</p>
                    <p className="text-xs text-amber-600 mt-1">
                      {statusCounts.pending > 0 ? `↑ ${statusCounts.pending} pengajuan baru` : "Tidak ada pengajuan baru"}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-start">
              <div className="p-3 rounded-full bg-blue-100 mr-4">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dalam Proses</p>
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-muted rounded mt-1"></div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.processing}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {statusCounts.processing > 0 ? `${Math.ceil(statusCounts.processing / 2)} perlu verifikasi` : "Tidak ada yang diproses"}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-start">
              <div className="p-3 rounded-full bg-green-100 mr-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Selesai</p>
                {isLoading ? (
                  <div className="h-8 w-16 animate-pulse bg-muted rounded mt-1"></div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-foreground">{statusCounts.completed}</p>
                    <p className="text-xs text-green-600 mt-1">↑ 15% dari bulan lalu</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary">Pengajuan Terbaru</h2>
            <Link href="/admin/submissions">
              <Button variant="outline" size="sm" className="gap-1">
                Lihat Semua <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : latestSubmissions.length > 0 ? (
                <SubmissionTable 
                  submissions={latestSubmissions}
                  showUser={true}
                  isAdmin={true}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Tidak Ada Pengajuan</h3>
                  <p className="text-muted-foreground">
                    Belum ada pengajuan yang masuk ke sistem
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Document Management and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alat Pengelolaan Dokumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-border rounded-md hover:border-primary hover:bg-accent/10 transition-colors">
                <div className="flex items-start">
                  <div className="p-2 rounded-md bg-primary text-white mr-4">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Unggah Template Dokumen</h3>
                    <p className="text-sm text-muted-foreground mb-2">Tambahkan template dokumen baru yang bisa digunakan untuk pembuatan surat.</p>
                    <Link href="/admin/templates">
                      <Button size="sm" variant="outline">Kelola Template</Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-md hover:border-primary hover:bg-accent/10 transition-colors">
                <div className="flex items-start">
                  <div className="p-2 rounded-md bg-primary text-white mr-4">
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Tinjau Dokumen Masuk</h3>
                    <p className="text-sm text-muted-foreground mb-2">Tinjau dokumen yang diunggah masyarakat untuk diverifikasi.</p>
                    <Link href="/admin/submissions?status=pending">
                      <Button size="sm" variant="outline">Lihat Dokumen</Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-md hover:border-primary hover:bg-accent/10 transition-colors">
                <div className="flex items-start">
                  <div className="p-2 rounded-md bg-primary text-white mr-4">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Kelola Pengguna</h3>
                    <p className="text-sm text-muted-foreground mb-2">Lihat dan kelola daftar pengguna sistem.</p>
                    <Link href="/admin/users">
                      <Button size="sm" variant="outline">Kelola Pengguna</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Statistik & Laporan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground mb-2">Distribusi Jenis Pengajuan</h3>
                <div className="h-48 bg-muted/40 rounded-md flex items-center justify-center">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <div className="text-center">
                      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Grafik Distribusi Pengajuan</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-foreground mb-2">Aktivitas Bulanan</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-40">Surat Keterangan Usaha</span>
                    <div className="flex-grow bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">32</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-40">Pembaruan KK</span>
                    <div className="flex-grow bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">28</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-40">Pembaruan KTP</span>
                    <div className="flex-grow bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "55%" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">24</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-40">Surat Domisili</span>
                    <div className="flex-grow bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">19</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground w-40">Lainnya</span>
                    <div className="flex-grow bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: "30%" }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">13</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="link" className="text-amber-500 hover:text-amber-600 p-0">
                  Lihat Laporan Lengkap →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
