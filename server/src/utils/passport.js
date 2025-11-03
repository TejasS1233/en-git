import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.model.js";

console.log("🔐 OAuth Config Check:");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "✅ Set" : "❌ Missing");
console.log("SERVER_URL:", process.env.SERVER_URL);
console.log("CLIENT_URL:", process.env.CLIENT_URL);

// Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/v1/users/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) throw new Error("Email not found in Google profile");

        let user = await User.findOne({ email });

        if (user) {
          // Link Google ID if not already linked
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save({ validateBeforeSave: false });
          }
        } else {
          // Create new user
          user = await User.create({
            fullname: profile.displayName,
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || "",
            address: "",
            phoneNumber: "",
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// GitHub OAuth
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/v1/users/auth/github/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // GitHub may not provide email if it's private, use a fallback
        let email = profile.emails?.[0]?.value?.toLowerCase();

        // If no email, use GitHub ID as fallback
        if (!email) {
          email = `${profile.username}@github-user.local`;
          console.log(`⚠️ No email from GitHub, using fallback: ${email}`);
        }

        let user = await User.findOne({ email });

        if (user) {
          // Always update GitHub info and access token
          user.githubId = profile.id;
          user.githubUsername = profile.username;
          user.githubAccessToken = accessToken;
          await user.save({ validateBeforeSave: false });
        } else {
          // Create new user
          user = await User.create({
            fullname: profile.displayName || profile.username,
            email,
            githubId: profile.id,
            githubUsername: profile.username,
            githubAccessToken: accessToken,
            avatar: profile.photos?.[0]?.value || "",
            address: "",
            phoneNumber: "",
          });
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport;
