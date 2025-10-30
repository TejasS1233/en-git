import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="outline"
      onClick={toggleTheme}
      className="relative w-10 h-10 p-0 rounded-full flex items-center justify-center"
    >
      <Sun
        className={`h-5 w-5 transition-all ${theme === "dark" ? "scale-0 -rotate-90" : "scale-100 rotate-0"
          }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all ${theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"
          }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
