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

  if ([email, fullname, password, countryCode, phoneNumber, address].some(f => !f?.trim())) {
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

  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) throw new ApiError("Invalid password", 401);

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(new ApiResponse(200, "User logged in successfully", { user: loggedInUser, accessToken, refreshToken }));
});

// ---------------- LOGOUT ----------------
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { refreshToken: undefined } });

  return res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
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

  return res
    .status(200)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: true })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: true })
    .json(new ApiResponse(200, "Access token refreshed successfully", { accessToken, refreshToken }));
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
  const { fullname, email, countryCode, phoneNumber, address } = req.body;
  if (!fullname || !email || !countryCode || !phoneNumber || !address) throw new ApiError("All fields required", 400);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { fullname, email, countryCode, phoneNumber, address },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new ApiResponse(200, "User updated successfully", updatedUser));
});

// ---------------- UPDATE AVATAR ----------------
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) throw new ApiError("Avatar file missing", 400);

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) throw new ApiError("Avatar upload failed", 400);

  const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatar.url }, { new: true }).select("-password");
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
