import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  User,
  Settings,
  BellRing,
  LogOut,
  ChevronDown,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { logout, user } = useAuth();
  
  // Obtener perfil del usuario para mostrar nombre y avatar
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="font-semibold text-lg"
              onClick={() => navigate("/dashboard")}
            >
              AIPI
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellRing className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('notifications')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  <div className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">
                    {t('no_new_notifications')}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {profile?.username || user?.username || t('user')}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard?tab=settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard?tab=subscription")}>
                  <Inbox className="mr-2 h-4 w-4" />
                  <span>{t('subscription')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                © 2025 AIPI.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="link"
                size="sm"
                className="text-gray-500 dark:text-gray-400"
                onClick={() => navigate("/docs")}
              >
                {t('documentation')}
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-gray-500 dark:text-gray-400"
                onClick={() => navigate("/pricing")}
              >
                {t('pricing')}
              </Button>
              <Button
                variant="link"
                size="sm"
                className="text-gray-500 dark:text-gray-400"
                onClick={() => navigate("/get-started")}
              >
                {t('get_started')}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}