import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

export const NavigationSheet = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigation = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-muted"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-[280px] flex-col justify-between p-6 z-2000">
        <VisuallyHidden>
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Navigate to different sections of the website</SheetDescription>
        </VisuallyHidden>

        <div className="space-y-8">
          <div className="flex items-center">
            <Logo />
          </div>
          <nav className="space-y-4">
            <NavLink
              to="/"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block text-base font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/compare"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block text-base font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Compare Users
            </NavLink>
            <NavLink
              to="/repo"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block text-base font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Repository Insights
            </NavLink>
            <NavLink
              to="/leaderboard"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block text-base font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Leaderboard
            </NavLink>
            <NavLink
              to="/challenges"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block text-base font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Challenges
            </NavLink>
            <NavLink
              to="/widgets"
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "block text-base font-medium transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Widgets
            </NavLink>
          </nav>
        </div>

        {!user && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => handleNavigation("/login")}
            >
              Sign In
            </Button>
            <Button className="w-full rounded-full" onClick={() => handleNavigation("/signup")}>
              Get Started
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
