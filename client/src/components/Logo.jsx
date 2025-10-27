export const Logo = () => (
  <svg width="100" height="32" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#38bdf8", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#7dd3fc", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Icon with "eg" text */}
    <rect x="0" y="0" width="32" height="32" rx="6.4" fill="url(#logo-gradient)" />
    <text
      x="16"
      y="16"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="16"
      fontWeight="bold"
      fill="white"
    >
      eg
    </text>
    {/* "en-git" text */}
    <text
      x="40"
      y="20"
      dominantBaseline="middle"
      fontFamily="system-ui, -apple-system, sans-serif"
      fontSize="18"
      fontWeight="bold"
      className="fill-foreground"
    >
      en-git
    </text>
  </svg>
);
