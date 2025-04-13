import { useAuth } from "@/hooks/use-auth";
import UserLayout from "@/components/layout/user-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Submission } from "@shared/schema";
import ServiceCard from "@/components/service-card";
import SubmissionTable from "@/components/submission-table";
import { FileSearch, FileSignature } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const services = [
  {
    id: "na",
    title: "Surat Nikah (NA)",
    description: "Pengajuan dokumen NA untuk keperluan pernikahan.",
    icon: "FileText"
  },
  {
    id: "ktp",
    title: "Pembaruan KTP",
    description: "Perbarui Kartu Tanda Penduduk yang akan/telah habis masa berlakunya.",
    icon: "CreditCard"
  },
  {
    id: "kk",
    title: "Pembaruan KK",
    description: "Perbarui data Kartu Keluarga dengan data terbaru.",
    icon: "Users"
  },
  {
    id: "usaha",
    title: "Keterangan Usaha",
    description: "Surat pengantar untuk pengurusan izin usaha.",
    icon: "Store"
  },
  {
    id: "domisili",
    title: "Keterangan Domisili",
    description: "Surat keterangan tempat tinggal untuk berbagai keperluan.",
    icon: "Home"
  },
  {
    id: "tidak_sengketa",
    title: "Keterangan Tidak Bersengketa",
    description: "Surat keterangan status tanah atau properti.",
    icon: "HandShake"
  },
  {
    id: "pengantar",
    title: "Surat Pengantar",
    description: "Surat pengantar untuk berbagai keperluan administratif.",
    icon: "ClipboardList"
  },
  {
    id: "lainnya",
    title: "Layanan Lainnya",
    description: "Berbagai layanan administrasi lainnya sesuai kebutuhan.",
    icon: "FileSignature"
  }
];

export default function UserDashboard() {
  const { user } = useAuth();
  
  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/user"],
    retry: false
  });

  const pendingCount = submissions?.filter(s => s.status !== "completed").length || 0;
  const completedCount = submissions?.filter(s => s.status === "completed").length || 0;

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Welcome & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-primary mb-2">Selamat Datang, {user?.fullName}</h2>
            <p className="text-muted-foreground mb-4">
              Gunakan sistem administrasi desa untuk mengajukan berbagai layanan dokumen kependudukan dan administrasi lainnya secara online.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/user/submission/new">
                <Button variant="default" className="bg-amber-500 hover:bg-amber-600">
                  <FileSignature className="mr-2 h-4 w-4" /> Buat Pengajuan Baru
                </Button>
              </Link>
              <Link href="/user/status">
                <Button variant="default">
                  <FileSearch className="mr-2 h-4 w-4" /> Cek Status Pengajuan
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-primary mb-3">Ringkasan Pengajuan</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-neutral-100 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-primary">{pendingCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Dalam Proses</p>
              </div>
              <div className="text-center p-3 bg-neutral-100 rounded-lg">
                {isLoading ? (
                  <Skeleton className="h-8 w-8 mx-auto mb-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                )}
                <p className="text-sm text-muted-foreground">Selesai</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4">Layanan Administrasi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <ServiceCard 
                key={service.id}
                id={service.id}
                title={service.title}
                description={service.description}
                icon={service.icon}
              />
            ))}
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">Pengajuan Terakhir</h2>
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6">
                  <Skeleton className="h-48 w-full" />
                </div>
              ) : submissions && submissions.length > 0 ? (
                <SubmissionTable 
                  submissions={submissions.slice(0, 3)} 
                  showUser={false}
                />
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Belum ada pengajuan yang dibuat</p>
                  <Link href="/user/submission/new">
                    <Button className="mt-4 bg-amber-500 hover:bg-amber-600">
                      Buat Pengajuan Baru
                    </Button>
                  </Link>
                </div>
              )}
              
              {submissions && submissions.length > 0 && (
                <div className="bg-muted/20 px-4 py-3 border-t border-border flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan <span className="font-medium">1-{Math.min(3, submissions.length)}</span> dari{" "}
                    <span className="font-medium">{submissions.length}</span> pengajuan
                  </div>
                  <div>
                    <Link href="/user/status">
                      <Button variant="link" className="text-primary hover:text-primary/80">
                        Lihat Semua Pengajuan →
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}
