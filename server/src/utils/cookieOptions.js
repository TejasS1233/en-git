// Cookie options for cross-domain authentication
// sameSite: "none" is required for cookies to work across different domains
// (e.g., frontend on Vercel, backend on Render)
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: true, // Required for sameSite: "none"
  sameSite: "none", // Required for cross-domain cookies
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

export const getClearCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
});
