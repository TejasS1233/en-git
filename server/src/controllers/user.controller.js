import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError("User not found", 404);

  const accessToken = await user.generateAuthToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// ---------------- USER REGISTRATION ----------------
const registerUser = asyncHandler(async (req, res) => {
  const { email, fullname, password, countryCode, phoneNumber, address } = req.body;

  if ([email, fullname, password, countryCode, phoneNumber, address].some((f) => !f?.trim())) {
    throw new ApiError("Please fill all the fields", 400);
  }

  const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (existingUser) throw new ApiError("User already exists", 409);

  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError("Please upload avatar", 400);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) throw new ApiError("Avatar upload failed", 400);

  const user = await User.create({
    fullname,
    email: email.toLowerCase(),
    countryCode,
    phoneNumber,
    address,
    password,
    avatar: avatar.url,
  });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  return res.status(201).json(new ApiResponse(201, "User registered successfully", createdUser));
});

// ---------------- USER LOGIN ----------------
const loginUser = asyncHandler(async (req, res) => {
  const { email, phoneNumber, password } = req.body;
  if (!email && !phoneNumber) throw new ApiError("Email or phone required", 400);

  const user = await User.findOne({ $or: [{ email }, { phoneNumber }] });
  if (!user) throw new ApiError("User not found", 404);

  // Check if user signed up with OAuth (no password)
  if (!user.password && (user.googleId || user.githubId)) {
    const provider = user.googleId ? "Google" : "GitHub";
    throw new ApiError(
      `This account uses ${provider} login. Please sign in with ${provider}.`,
      400
    );
  }

  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) throw new ApiError("Invalid password", 401);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

// ---------------- LOGOUT ----------------
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json(new ApiResponse(200, "User logged out successfully"));
});

// ---------------- REFRESH TOKEN ----------------
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incRefreshToken) throw new ApiError("Please provide refresh token", 401);

  const decodedToken = jwt.verify(incRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id);
  if (!user) throw new ApiError("User not found", 404);
  if (user.refreshToken !== incRefreshToken) throw new ApiError("Invalid refresh token", 401);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, "Access token refreshed successfully", { accessToken, refreshToken })
    );
});

// ---------------- CHANGE PASSWORD ----------------
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError("User not found", 404);

  const isPassCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPassCorrect) throw new ApiError("Incorrect old password", 401);

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});

// ---------------- CURRENT USER ----------------
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password -refreshToken");
  return res.status(200).json(new ApiResponse(200, "Current user fetched successfully", user));
});

// ---------------- UPDATE USER ----------------
const updateCurrentUser = asyncHandler(async (req, res) => {
  const {
    fullname,
    email,
    countryCode,
    phoneNumber,
    address,
    githubUsername,
    walletAddress,
    emailPreferences,
  } = req.body;

  // Build update object with only provided fields
  const updateFields = {};
  if (fullname !== undefined) updateFields.fullname = fullname;
  if (email !== undefined) updateFields.email = email;
  if (countryCode !== undefined) updateFields.countryCode = countryCode;
  if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
  if (address !== undefined) updateFields.address = address;
  if (githubUsername !== undefined) updateFields.githubUsername = githubUsername;
  if (walletAddress !== undefined) updateFields.walletAddress = walletAddress;
  if (emailPreferences !== undefined) updateFields.emailPreferences = emailPreferences;

  const updatedUser = await User.findByIdAndUpdate(req.user._id, updateFields, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, "User updated successfully", updatedUser));
});

// ---------------- UPDATE AVATAR ----------------
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError("Avatar file missing", 400);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) throw new ApiError("Avatar upload failed", 400);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatar.url },
    { new: true }
  ).select("-password");
  return res.status(200).json(new ApiResponse(200, "Avatar updated successfully", user));
});

// ---------------- USER PROFILE ----------------
const getUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError("User ID is required", 400);

  const user = await User.findById(id).select("-password -refreshToken");
  if (!user) throw new ApiError("User not found", 404);

  return res.status(200).json(new ApiResponse(200, "User profile fetched successfully", user));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateCurrentUser,
  updateUserAvatar,
  getUserProfile,
};
