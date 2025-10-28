export const Logo = ({ className = "", textClassName = "" }) => (
  <div className={`flex items-center gap-2`}>
    {/* apply sizing/extra classes to the image only so the wrapper doesn't become constrained */}
    <img src="/engit-icon.png" alt="en-git" className={`h-8 w-auto ${className}`} />
    {/* prevent the text from wrapping into multiple lines */}
    <span className={`text-xl font-bold whitespace-nowrap ${textClassName}`}>en-git</span>
  </div>
);
