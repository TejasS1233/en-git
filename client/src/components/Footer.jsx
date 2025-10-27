import { GithubIcon, Star } from "lucide-react";

const Footer = () => {
  return (
    <footer>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 flex items-center justify-between px-4 sm:px-6 xl:px-0 border-t">
          <span className="text-muted-foreground text-xs sm:text-sm">
            &copy; {new Date().getFullYear()} en-git. Built by Tejas.
          </span>

          <div className="flex items-center gap-4 text-muted-foreground">
            <a
              href="https://github.com/TejasS1233"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
              title="GitHub Profile"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/TejasS1233/en-git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm"
              title="Star on GitHub"
            >
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Star</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
