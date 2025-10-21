import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateCurrentUser,
  updateUserAvatar,
  getUserProfile,
} from "../controllers/user.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import passport from "../utils/passport.js";
import { generateAccessToken } from "../utils/jwt.js";

const router = Router();

// -------------------- PUBLIC ROUTES --------------------
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);

// -------------------- AUTH ROUTES --------------------
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/me", verifyJWT, updateCurrentUser);
router.patch("/me/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);
router.get("/profile/:id", getUserProfile);

// -------------------- OAUTH LOGIN --------------------

// --- Google OAuth ---
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// --- Google OAuth Callback ---
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) return res.redirect("/login");
    const token = generateAccessToken(req.user);
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .redirect("http://localhost:5173/auth/callback");
  }
);

// --- GitHub OAuth ---
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// --- GitHub OAuth Callback ---
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) return res.redirect("/login");
    const token = generateAccessToken(req.user);
    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .redirect("http://localhost:5173/auth/callback");
  }
);

export default router;
