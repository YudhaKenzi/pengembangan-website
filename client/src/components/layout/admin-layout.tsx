import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Bell, 
  ChevronDown, 
  ClipboardList, 
  Cog, 
  Home, 
  LogOut, 
  Menu, 
  User, 
  Users2, 
  X 
} from "lucide-react";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home },
    { href: "/admin/submissions", label: "Pengajuan", icon: ClipboardList },
    { href: "/admin/users", label: "Pengguna", icon: Users2 },
    { href: "/admin/settings", label: "Pengaturan", icon: Cog },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <aside 
        className={`bg-neutral-800 text-white h-full hidden md:flex flex-col ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 flex items-center justify-between border-b border-neutral-700">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-neutral-400 text-xs">Desa Air Kulim</p>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="h-10 w-10 mx-auto rounded-full bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-white hover:bg-neutral-700"
          >
            <ChevronDown className={`h-4 w-4 ${isSidebarCollapsed ? 'rotate-270' : 'rotate-90'}`} />
          </Button>
        </div>
        <nav className="p-2 flex-grow">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <a className={`flex items-center rounded-md p-2 ${
                      location === link.href 
                        ? 'bg-primary text-white' 
                        : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {!isSidebarCollapsed && <span className="ml-3">{link.label}</span>}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-2 border-t border-neutral-700">
          <Button
            variant="ghost"
            className={`w-full justify-start text-red-300 hover:bg-red-900/40 hover:text-white ${
              isSidebarCollapsed ? 'px-2' : ''
            }`}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="ml-3">Keluar</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-neutral-800 text-white">
          <div className="p-4 flex items-center justify-between border-b border-neutral-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-neutral-400 text-xs">Desa Air Kulim</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="p-2">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a 
                      className={`flex items-center rounded-md p-2 ${
                        location === link.href 
                          ? 'bg-primary text-white' 
                          : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
                      }`}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <link.icon className="h-5 w-5 mr-3" />
                      {link.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="absolute bottom-4 w-full px-2">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main container */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold text-primary hidden sm:block">
              {navLinks.find(link => link.href === location)?.label || 'Admin Panel'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-600 hover:text-primary relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white">
                  3
                </Badge>
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border">
                  <div className="p-3 border-b">
                    <h3 className="font-medium text-primary">Notifikasi</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="p-3 border-b hover:bg-neutral-50">
                      <p className="text-sm font-medium text-neutral-800">Pengajuan baru: Surat Keterangan Domisili</p>
                      <p className="text-xs text-neutral-500 mt-1">10 menit yang lalu</p>
                    </div>
                    <div className="p-3 border-b hover:bg-neutral-50">
                      <p className="text-sm font-medium text-neutral-800">Pengajuan baru: Pembaruan KTP</p>
                      <p className="text-xs text-neutral-500 mt-1">35 menit yang lalu</p>
                    </div>
                    <div className="p-3 hover:bg-neutral-50">
                      <p className="text-sm font-medium text-neutral-800">Dokumen diunggah: Surat Keterangan Usaha</p>
                      <p className="text-xs text-neutral-500 mt-1">2 jam yang lalu</p>
                    </div>
                  </div>
                  <div className="p-2 border-t text-center">
                    <Button variant="link" className="text-sm text-primary">
                      Lihat Semua Notifikasi
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span className="text-sm font-medium hidden sm:inline">{user?.fullName}</span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user ? getInitials(user.fullName) : "AD"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">
                    <a className="cursor-pointer w-full flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profil Admin
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings?tab=password">
                    <a className="cursor-pointer w-full flex items-center">
                      <Cog className="mr-2 h-4 w-4" />
                      Ubah Password
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50">
          {children}
        </main>
      </div>
    </div>
  );
}
