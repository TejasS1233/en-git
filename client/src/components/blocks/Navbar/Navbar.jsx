import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useChatbot } from "@/context/ChatbotContext";
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
import { LogOut, Settings, LayoutDashboard, User, HelpCircle } from "lucide-react";
import { NavigationSheet } from "./navigation-sheet";
import { Logo } from "@/components/Logo";
import { LanguageSelector } from "@/components/LanguageSelector";

export default function Navbar() {
  const { pathname } = useLocation();
  const [activePath, setActivePath] = useState(pathname);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openChatbot } = useChatbot();

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
    <div className="flex justify-center w-full fixed top-0 left-0 right-0 z-999 bg-background border-b border-border px-3 sm:px-6">
      <nav id="main-nav" className="z-1000 w-full max-w-6xl h-16">
        <div className="flex items-center justify-between p-3">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <ul className="hidden lg:flex items-center gap-6">
            <li>
              <Link
                to="/"
                className={`transition-colors text-sm ${
                  activePath === "/"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/compare"
                className={`transition-colors text-sm ${
                  activePath === "/compare"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Compare
              </Link>
            </li>
            <li>
              <Link
                to="/repo"
                className={`transition-colors text-sm ${
                  activePath === "/repo"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Repository
              </Link>
            </li>
            <li>
              <Link
                to="/leaderboard"
                className={`transition-colors text-sm ${
                  activePath === "/leaderboard"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Leaderboard
              </Link>
            </li>
            <li>
              <Link
                to="/challenges"
                className={`transition-colors text-sm ${
                  activePath === "/challenges"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Challenges
              </Link>
            </li>
            <li>
              <Link
                to="/widgets"
                className={`transition-colors text-sm ${
                  activePath === "/widgets"
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Widgets
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={openChatbot}
              className="h-9 w-9"
              title="Need help?"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer ring-2 ring-muted-foreground/20">
                    <AvatarImage src={user.avatar} alt={user.fullname} />
                    <AvatarFallback>{user.fullname?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="z-9999 w-48 rounded-xl shadow-md border bg-background"
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
                  className="hidden sm:inline-flex text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 cursor-pointer"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/signup")}
                  className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 cursor-pointer"
                >
                  Get Started
                </Button>
              </>
            )}
            <LanguageSelector />
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
