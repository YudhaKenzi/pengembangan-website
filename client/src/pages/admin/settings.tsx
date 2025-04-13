import { useState } from "react";
import AdminLayout from "@/components/layout/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Key, Save, Settings as SettingsIcon, User } from "lucide-react";

const profileFormSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini harus diisi"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
  confirmPassword: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok",
  path: ["confirmPassword"],
});

const organizationFormSchema = z.object({
  organizationName: z.string().min(3, "Nama organisasi minimal 3 karakter"),
  organizationAddress: z.string().min(5, "Alamat organisasi minimal 5 karakter"),
  organizationPhone: z.string().min(5, "Nomor telepon minimal 5 karakter"),
  organizationEmail: z.string().email("Format email tidak valid"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const organizationForm = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      organizationName: "Desa Air Kulim",
      organizationAddress: "Jl. Raya Air Kulim No. 123, Kecamatan Contoh, Kabupaten Desa",
      organizationPhone: "(021) 1234-5678",
      organizationEmail: "info@desaairkulim.desa.id",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profil berhasil diperbarui",
        description: "Perubahan profil Anda telah disimpan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui profil",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      const res = await apiRequest("POST", "/api/user/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password berhasil diperbarui",
        description: "Password Anda telah berhasil diubah",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: async (data: OrganizationFormValues) => {
      const res = await apiRequest("POST", "/api/settings/organization", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pengaturan organisasi berhasil diperbarui",
        description: "Informasi desa telah berhasil diperbarui",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal memperbarui pengaturan organisasi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onUpdateProfile = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const onUpdatePassword = (data: PasswordFormValues) => {
    updatePasswordMutation.mutate(data);
  };

  const onUpdateOrganization = (data: OrganizationFormValues) => {
    updateOrganizationMutation.mutate(data);
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
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-primary flex items-center">
            <SettingsIcon className="mr-2 h-5 w-5" /> Pengaturan
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile" className="flex items-center">
              <User className="mr-2 h-4 w-4" /> Profil
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center">
              <Key className="mr-2 h-4 w-4" /> Password
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center">
              <Building className="mr-2 h-4 w-4" /> Informasi Desa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil Admin</CardTitle>
                <CardDescription>
                  Kelola informasi profil Anda yang digunakan di sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="text-2xl">
                        {user ? getInitials(user.fullName) : "AD"}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Ubah Foto
                    </Button>
                  </div>

                  <div className="flex-1">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Lengkap</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nomor Telepon</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            disabled={updateProfileMutation.isPending}
                            className="flex gap-2"
                          >
                            <Save className="h-4 w-4" />
                            {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>
                  Perbarui password akun admin Anda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Saat Ini</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Baru</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password harus minimal 8 karakter
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Konfirmasi Password Baru</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        disabled={updatePasswordMutation.isPending}
                        className="flex gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {updatePasswordMutation.isPending ? "Menyimpan..." : "Perbarui Password"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Desa</CardTitle>
                <CardDescription>
                  Kelola informasi desa yang akan ditampilkan di sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...organizationForm}>
                  <form onSubmit={organizationForm.handleSubmit(onUpdateOrganization)} className="space-y-4">
                    <FormField
                      control={organizationForm.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Desa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={organizationForm.control}
                      name="organizationAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alamat Desa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={organizationForm.control}
                        name="organizationPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nomor Telepon Desa</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={organizationForm.control}
                        name="organizationEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Desa</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <CardFooter className="px-0 pt-4">
                      <Button 
                        type="submit" 
                        disabled={updateOrganizationMutation.isPending}
                        className="flex gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {updateOrganizationMutation.isPending ? "Menyimpan..." : "Simpan Informasi Desa"}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
