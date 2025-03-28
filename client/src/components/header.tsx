import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
  };
  
  const navLinks = [
    { name: "Dashboard", href: "/dashboard", auth: true },
    { name: "Integrations", href: "/dashboard?tab=integrations", auth: true },
    { name: "Analytics", href: "/analytics", auth: true },
    { name: "Settings", href: "/dashboard?tab=settings", auth: true },
  ];
  
  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Documentation", href: "/docs" },
  ];
  
  const activeLinks = user ? navLinks : publicLinks;
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <span className="text-primary-600 dark:text-primary-400 text-xl font-bold cursor-pointer">AIPI</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            {activeLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`${
                  location === link.href 
                    ? "text-primary-600 dark:text-primary-400" 
                    : "text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            {/* User menu for auth users */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&q=80" alt="User avatar" />
                      <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard?tab=profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard?tab=settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Button variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open mobile menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <nav className="flex flex-col space-y-4">
                    {activeLinks.map((link) => (
                      <Link 
                        key={link.name} 
                        href={link.href} 
                        className={`${
                          location === link.href 
                            ? "text-primary-600 dark:text-primary-400" 
                            : "text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                        }`}
                        onClick={() => setOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                    
                    {!user && (
                      <>
                        <Link 
                          href="/login" 
                          className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                          onClick={() => setOpen(false)}
                        >
                          Log in
                        </Link>
                        <Link 
                          href="/register" 
                          className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                          onClick={() => setOpen(false)}
                        >
                          Sign up
                        </Link>
                      </>
                    )}
                    
                    {user && (
                      <a 
                        href="#" 
                        className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400"
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(false);
                          handleLogout();
                        }}
                      >
                        Logout
                      </a>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
