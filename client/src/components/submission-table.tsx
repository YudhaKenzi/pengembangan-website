import { Submission } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Calendar, Download, FileText, MoreVertical } from "lucide-react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

interface SubmissionTableProps {
  submissions: Submission[];
  showUser?: boolean;
  isAdmin?: boolean;
}

export default function SubmissionTable({ 
  submissions, 
  showUser = false,
  isAdmin = false
}: SubmissionTableProps) {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = parseISO(dateString);
      return format(date, "dd MMM yyyy", { locale: id });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isAdmin ? "ID" : "No. Pengajuan"}
            </th>
            {showUser && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pemohon
              </th>
            )}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Jenis Layanan
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tanggal Pengajuan
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-border">
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {submission.id}
              </td>
              {showUser && submission.user && (
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <Avatar>
                        <AvatarFallback>{getInitials(submission.user.fullName)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{submission.user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{submission.user.email}</p>
                    </div>
                  </div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                {getDocumentTypeName(submission.type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(submission.createdAt)}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(submission.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {isAdmin ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Link href={`/admin/submissions/${submission.id}`} className="cursor-pointer flex items-center">
                            <FileText className="mr-2 h-4 w-4" />
                            Tinjau
                        </Link>
                      </DropdownMenuItem>
                      {submission.status === "completed" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            <Download className="mr-2 h-4 w-4" />
                            Unduh Dokumen
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Link href={`/user/submission/${submission.id}`} className="text-primary hover:text-primary/80">
                      Detail
                    </Link>
                    {submission.status === "completed" && (
                      <Link href={`/user/submission/${submission.id}/download`} className="text-amber-500 hover:text-amber-600">
                        Unduh
                      </Link>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
