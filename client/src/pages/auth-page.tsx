import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username harus diisi" }),
  password: z.string().min(1, { message: "Password harus diisi" }),
});

const registrationSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(8, { message: "Konfirmasi kata sandi minimal 8 karakter" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Konfirmasi kata sandi tidak cocok",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"user" | "admin">("user");
  const [showRegister, setShowRegister] = useState(false);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      nik: "",
      email: "",
      phone: "",
      role: "user",
    },
  });

  const onLogin = async (data: LoginFormValues) => {
    const loginData = {
      ...data,
      role: activeTab === "admin" ? "admin" : "user",
    };
    loginMutation.mutate(loginData);
  };

  const onRegister = async (data: RegistrationFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  useEffect(() => {
    // Update role in the registration form when tab changes
    registerForm.setValue("role", activeTab === "admin" ? "admin" : "user");
  }, [activeTab, registerForm]);

  // Redirect if already logged in
  if (user) {
    return <Redirect to={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-100">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            {/* Using SVG for logo instead of an image */}
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-primary">Sistem Administrasi</h1>
            <h2 className="text-xl text-secondary-foreground">Desa Air Kulim</h2>
          </div>

          {!showRegister ? (
            <div>
              <div className="mb-4">
                <Tabs defaultValue="user" onValueChange={(value) => setActiveTab(value as "user" | "admin")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="user">Masyarakat</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email / Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan email atau username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata Sandi</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Masukkan kata sandi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Memproses..." : "Masuk"}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum memiliki akun?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 text-primary hover:text-primary/80"
                    onClick={() => setShowRegister(true)}
                  >
                    Daftar Sekarang
                  </Button>
                </p>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-primary">Daftar Akun Baru</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowRegister(false)}
                >
                  &times;
                </Button>
              </div>

              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="Nama sesuai KTP" 
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="nik"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="16 digit Nomor Induk Kependudukan" 
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value || ""}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="email@contoh.com" 
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value || ""}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. Handphone</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="08xxxxxxxxxx" 
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value || ""}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input 
                            type="text"
                            placeholder="Username untuk login" 
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value || ""}
                            name={field.name}
                            onBlur={field.onBlur}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kata Sandi</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Minimal 8 karakter" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Ulangi kata sandi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Memproses..." : "Daftar"}
                  </Button>
                </form>
              </Form>

              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-primary hover:text-primary/80"
                  onClick={() => setShowRegister(false)}
                >
                  Kembali ke halaman login
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
