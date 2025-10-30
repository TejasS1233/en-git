export function CustomLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-cyan-500 border-r-purple-500 animate-spin" />

        {/* Middle rotating ring */}
        <div className="absolute inset-2 w-20 h-20 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin-slow" />

        {/* Inner pulsing circle */}
        <div className="absolute inset-6 w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-purple-500 animate-pulse" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>

      {/* Loading text */}
      <div className="absolute mt-32 text-center">
        <p className="text-lg font-semibold bg-linear-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
          Analyzing Profile...
        </p>
      </div>
    </div>
  );
}
