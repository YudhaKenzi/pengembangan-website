import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import UserLayout from "@/components/layout/user-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/file-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileSignature, Send } from "lucide-react";

const documentTypes = [
  { id: "na", label: "Surat Nikah (NA)" },
  { id: "ktp", label: "Pembaruan KTP" },
  { id: "kk", label: "Pembaruan KK" },
  { id: "usaha", label: "Keterangan Usaha" },
  { id: "domisili", label: "Keterangan Domisili" },
  { id: "tidak_sengketa", label: "Keterangan Tidak Bersengketa" },
  { id: "pengantar", label: "Surat Pengantar" },
  { id: "lainnya", label: "Layanan Lainnya" },
];

const formSchema = z.object({
  type: z.string({
    required_error: "Pilih jenis dokumen",
  }),
  title: z.string().min(5, {
    message: "Judul pengajuan minimal 5 karakter",
  }),
  description: z.string().min(10, {
    message: "Deskripsi minimal 10 karakter",
  }),
  documents: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmissionForm() {
  const { type } = useParams();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  // Default values based on the route parameter
  const selectedType = type !== "new" 
    ? documentTypes.find(dt => dt.id === type)?.id || ""
    : "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: selectedType,
      title: "",
      description: "",
      documents: [],
    },
  });

  const uploadFiles = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      try {
        const res = await apiRequest('POST', '/api/upload', formData, { isFormData: true });
        return await res.json();
      } catch (error) {
        console.error("File upload error:", error);
        throw new Error('Gagal mengunggah file. Silakan coba lagi.');
      }
    }
  });

  const createSubmission = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/submissions", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pengajuan berhasil dibuat",
        description: "Pengajuan Anda telah dikirim dan akan diproses oleh admin",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/user"] });
      navigate("/user/status");
    },
    onError: (error: Error) => {
      toast({
        title: "Pengajuan gagal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setFormSubmitted(true);
      setUploading(true);
      // Upload files first if needed
      if (files.length > 0) {
        const uploadResult = await uploadFiles.mutateAsync(files);
        if (uploadResult && uploadResult.fileUrls) {
          data.documents = uploadResult.fileUrls;
        }
      }
      
      // Then create the submission with file URLs
      await createSubmission.mutateAsync(data);
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Gagal membuat pengajuan",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pengajuan",
        variant: "destructive",
      });
      setFormSubmitted(false);
    } finally {
      setUploading(false);
    }
  };

  const isSubmitting = form.formState.isSubmitting || createSubmission.isPending || uploading;

  return (
    <UserLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")} 
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-semibold text-primary">Form Pengajuan Dokumen</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileSignature className="h-5 w-5 mr-2" /> 
              Form Pengajuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Dokumen</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis dokumen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {documentTypes.map((docType) => (
                            <SelectItem key={docType.id} value={docType.id}>
                              {docType.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pilih jenis dokumen yang akan diajukan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Judul Pengajuan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Pembaruan KTP yang hilang" {...field} />
                      </FormControl>
                      <FormDescription>
                        Berikan judul yang jelas untuk pengajuan ini
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jelaskan detail keperluan pengajuan Anda" 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Jelaskan tujuan dan keperluan pengajuan dokumen ini
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Dokumen Pendukung</FormLabel>
                  <FileUpload 
                    maxFiles={5} 
                    onFilesChange={setFiles}
                    acceptedFileTypes={['.jpg', '.jpeg', '.png', '.pdf']}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Unggah dokumen pendukung seperti KTP, KK, atau dokumen lain yang diperlukan (maks. 5 file, format: JPG, PNG, PDF)
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="bg-amber-500 hover:bg-amber-600"
                  >
                    {isSubmitting ? (
                      <>Mengirim...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" /> Kirim Pengajuan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
