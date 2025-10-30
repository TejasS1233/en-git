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
import { Menu, Github } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useAuth } from "@/context/AuthContext";
import { NAV_LINKS } from "@/config/nav";
import { cn } from "@/lib/utils";

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
          <div className="flex items-center gap-2">
            <Github className="w-7 h-7 text-primary" />
            <span className="font-bold text-2xl bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              en-git
            </span>
          </div>
          <nav className="space-y-4">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="block text-base font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {link.label}
                </a>
              ) : (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "block text-base font-medium transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
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
