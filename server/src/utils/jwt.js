import jwt from "jsonwebtoken";

// Generate access token for a user
export const generateAccessToken = (user) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in .env");
  }

  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      fullName: user.fullName || user.name,
      role: user.role || "user",
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};

// Verify access token
export const verifyAccessToken = (token) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not defined in .env");
  }

  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    console.error("Invalid token:", err.message);
    return null;
  }
};

// Generate refresh token
export const generateRefreshToken = (user) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is not defined in .env");
  }

  return jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  });
};
