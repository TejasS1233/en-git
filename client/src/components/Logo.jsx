export const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <img src="/engit-icon.png" alt="en-git" className="h-8 w-auto" />
    <span className="text-xl font-bold">en-git</span>
  </div>
);
