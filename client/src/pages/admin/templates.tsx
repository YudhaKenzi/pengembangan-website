import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/file-upload";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, File, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TemplateManager() {
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateFiles, setTemplateFiles] = useState<File[]>([]);
  
  const { toast } = useToast();

  interface Template {
    id: string;
    name: string;
    type: string;
    description: string;
    fileUrl: string;
  }
  
  const [templates, setTemplates] = useState<Template[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append("files", file);
      });
      
      const res = await apiRequest("POST", "/api/upload", formData, { isFormData: true });
      
      return await res.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async (templateData: any) => {
      const res = await apiRequest("POST", "/api/templates", templateData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Berhasil",
        description: "Template berhasil disimpan",
      });
      
      // Clear form and add to templates list
      setTemplates([...templates, {
        id: Date.now().toString(),
        name: templateName,
        type: templateType,
        description: templateDescription,
        fileUrl: data.fileUrl
      }]);
      
      setTemplateName("");
      setTemplateType("");
      setTemplateDescription("");
      setTemplateFiles([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const res = await apiRequest("DELETE", `/api/templates/${templateId}`);
      return await res.json();
    },
    onSuccess: (_, templateId) => {
      toast({
        title: "Berhasil",
        description: "Template berhasil dihapus",
      });
      
      // Remove from templates list
      setTemplates(templates.filter(t => t.id !== templateId));
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateName || !templateType || !templateDescription || templateFiles.length === 0) {
      toast({
        title: "Validasi Gagal",
        description: "Harap lengkapi semua bidang formulir dan unggah file template",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // First upload files
      const uploadResult = await uploadMutation.mutateAsync(templateFiles);
      
      // Then save template with file URLs
      await saveTemplateMutation.mutateAsync({
        name: templateName,
        type: templateType,
        description: templateDescription,
        fileUrl: uploadResult.fileUrls[0]
      });
    } catch (error) {
      // Handled by mutation error handlers
    }
  };

  const handleDelete = (templateId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus template ini?")) {
      deleteTemplateMutation.mutate(templateId);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-primary mb-6">Pengelolaan Template Dokumen</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Template Form */}
          <Card>
            <CardHeader>
              <CardTitle>Tambah Template Baru</CardTitle>
              <CardDescription>
                Unggah template dokumen untuk digunakan dalam pembuatan surat atau dokumen
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nama Template</Label>
                  <Input 
                    id="template-name" 
                    placeholder="Contoh: Surat Keterangan Usaha"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-type">Jenis Dokumen</Label>
                  <Select
                    value={templateType}
                    onValueChange={setTemplateType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis dokumen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ktp">KTP</SelectItem>
                      <SelectItem value="kk">Kartu Keluarga</SelectItem>
                      <SelectItem value="usaha">Surat Keterangan Usaha</SelectItem>
                      <SelectItem value="domisili">Surat Keterangan Domisili</SelectItem>
                      <SelectItem value="nikah">Surat Nikah / NA</SelectItem>
                      <SelectItem value="sengketa">Surat Keterangan Tidak Sengketa</SelectItem>
                      <SelectItem value="pengantar">Surat Pengantar</SelectItem>
                      <SelectItem value="lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-description">Deskripsi</Label>
                  <Input 
                    id="template-description" 
                    placeholder="Jelaskan kegunaan template ini"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>File Template</Label>
                  <FileUpload 
                    maxFiles={1}
                    onFilesChange={setTemplateFiles}
                    acceptedFileTypes={['.doc', '.docx', '.pdf']}
                  />
                  <p className="text-xs text-muted-foreground">
                    Unggah file dalam format .doc, .docx, atau .pdf (maks. 5MB)
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={uploadMutation.isPending || saveTemplateMutation.isPending}
                >
                  {(uploadMutation.isPending || saveTemplateMutation.isPending) ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Tambahkan Template</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          {/* Template List */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-primary">Template Tersedia</h2>
            
            {templates.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <File className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-medium">Belum Ada Template</h3>
                  <p className="text-muted-foreground">
                    Tambahkan template dokumen dengan mengisi formulir di samping
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-foreground">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => window.open(template.fileUrl, '_blank')}
                              className="text-primary text-sm hover:underline flex items-center"
                            >
                              <File className="h-3 w-3 mr-1" /> Lihat Template
                            </button>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {template.type}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                          onClick={() => handleDelete(template.id)}
                          disabled={deleteTemplateMutation.isPending}
                        >
                          {deleteTemplateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}