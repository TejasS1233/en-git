import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/ModeToggle";
import { NAV_LINKS } from "@/config/nav";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings, LayoutDashboard, User } from "lucide-react";
import { NavigationSheet } from "./navigation-sheet";
import { Logo } from "@/components/Logo";

export default function Navbar() {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(pathname);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case "student":
        return "/dashboard-student";
      case "client":
        return "/dashboard-business";
      default:
        return "/";
    }
  };

  return (
    <div className="flex justify-center w-full fixed top-0 left-0 right-0 z-[999] bg-background border-b border-border px-6">
      <nav
        id="main-nav"
        className="z-[1000]
   w-full max-w-6xl h-16"
      >
        <div className="flex items-center justify-between p-3">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <ul className="hidden md:flex gap-8">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={`transition-colors ${
                    activePath === item.href
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-muted-foreground/20">
                    <AvatarImage src={user.avatar} alt={user.fullname} />
                    <AvatarFallback>{user.fullname?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-[9999] w-48 rounded-xl shadow-md border bg-background"
                >
                  <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(`/user-profile/${user._id}`)}
                    className="gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")} className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button onClick={() => navigate("/signup")}>Get Started</Button>
              </>
            )}
            <ModeToggle className="hidden md:inline-flex" />
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
