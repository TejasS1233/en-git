import { GithubIcon, Star, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 xl:px-0 border-t">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-xs sm:text-sm">
              &copy; {new Date().getFullYear()} en-git. Built by Tejas.
            </span>
            <a
              href="https://tejass1233.hashnode.dev/i-built-a-tool-to-stalk-github-profiles-legally"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm text-muted-foreground"
              title="Blog"
            >
              <span className="hidden sm:inline">Blog</span>
            </a>
            <Link
              to="/contact"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors text-sm text-muted-foreground"
              title="Contact Us"
            >
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </Link>
            <a
              href="https://github.com/TejasS1233"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors text-muted-foreground"
              title="GitHub Profile"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          </div>

          <a
            href="https://www.producthunt.com/products/en-git?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-en-git"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1031912&theme=neutral&t=1761718237434"
              alt="en-git - Stalk GitHub profiles and compare developers (legally) | Product Hunt"
              style={{ width: "200px", height: "43px" }}
              width="200"
              height="43"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
