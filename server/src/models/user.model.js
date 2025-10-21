import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: function() {
        // Required if user signs up via password or no OAuth provider
        return !this.googleId && !this.githubId;
      },
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    countryCode: {
      type: String,
      default: "+91",
    },
    phoneNumber: {
      type: String,
      required: function() {
        return !this.googleId && !this.githubId;
      },
    },
    address: {
      type: String,
      required: function() {
        return !this.googleId && !this.githubId;
      },
    },
    avatar: {
      type: String,
      required: function() {
        return !this.googleId && !this.githubId;
      },
    },
    password: {
      type: String,
      required: function() {
        return !this.googleId && !this.githubId;
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      required: true,
    },
    refreshToken: String,
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    refreshToken: {
      type: String,
    },
    githubUsername: {
      type: String,
      trim: true,
      index: true,
    },
    lastSnapshotDate: {
      type: Date,
    },
    snapshotFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    walletAddress: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty wallet address
          // Basic Ethereum address validation (42 chars, starts with 0x)
          return /^0x[a-fA-F0-9]{40}$/.test(v);
        },
        message: 'Invalid Ethereum wallet address format'
      },
      index: true,
    },
    credentialBadges: [
      {
        badgeId: { type: String, required: true },
        tokenId: { type: String },
        txHash: { type: String },
        chainId: { type: String },
        metadataURI: { type: String },
        mintedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate JWT
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      fullname: this.fullname,
      phoneNumber: this.phoneNumber,
      address: this.address,
      avatar: this.avatar,
      role: this.role,
      countryCode: this.countryCode,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
