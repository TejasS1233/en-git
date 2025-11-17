import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Camera } from "lucide-react";
import LockedAchievements from "@/components/LockedAchievements";
import { GitHubUsernameBanner } from "@/components/GitHubUsernameBanner";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);
  const githubUsernameRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        console.log("Fetching user profile for ID:", id);
        const res = await axiosInstance.get(`/users/profile/${id}`);
        console.log("User profile data:", res.data);
        setUser(res.data.data);
        setFormData(res.data.data);
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(error.response?.data?.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const capitalize = (word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : "");

  const getExplorerUrl = (chainId, txHash) => {
    if (!chainId || !txHash) return "#";

    const explorerMap = {
      1: "https://etherscan.io", // Ethereum Mainnet
      11155111: "https://sepolia.etherscan.io", // Sepolia Testnet
      137: "https://polygonscan.com", // Polygon Mainnet
      80001: "https://mumbai.polygonscan.com", // Polygon Mumbai Testnet
      56: "https://bscscan.com", // BSC Mainnet
      97: "https://testnet.bscscan.com", // BSC Testnet
      42161: "https://arbiscan.io", // Arbitrum One
      421614: "https://sepolia.arbiscan.io", // Arbitrum Sepolia
      10: "https://optimistic.etherscan.io", // Optimism
      420: "https://sepolia-optimism.etherscan.io", // Optimism Sepolia
    };

    const baseUrl = explorerMap[chainId] || "https://etherscan.io";
    return `${baseUrl}/tx/${txHash}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.patch("/users/me", formData);
      setUser(res.data.data);
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleEmailPreferenceChange = async (preference, value) => {
    const newPreferences = {
      ...(formData.emailPreferences || {}),
      [preference]: value,
    };

    setFormData({
      ...formData,
      emailPreferences: newPreferences,
    });

    // Auto-save email preferences
    try {
      await axiosInstance.patch("/users/me", {
        emailPreferences: newPreferences,
      });
      toast.success("Email preference updated");
    } catch (error) {
      console.error("Failed to update email preference:", error);
      toast.error("Failed to update preference");
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    try {
      setUploading(true);
      const res = await axiosInstance.patch("/users/me/avatar", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUser((prev) => ({ ...prev, avatar: res.data.data.avatar }));
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error("Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-6 w-1/3 mb-6" />
        <div className="flex gap-6">
          <Skeleton className="h-32 w-32 rounded-full" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center text-muted-foreground">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-lvh items-center max-w-4xl mx-auto p-6 py-10 space-y-8">
      {/* Header with Avatar */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="h-28 w-28">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.fullname?.[0]}</AvatarFallback>
          </Avatar>
          {/* Hover overlay for avatar upload */}
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
          >
            {uploading ? "..." : <Camera className="h-6 w-6" />}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{user.fullname}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">{capitalize(user.role)}</p>
        </div>
      </div>

      {/* GitHub Username Banner - Only show if logged in and no GitHub username */}
      {user && !user.githubUsername && !user.githubId && (
        <GitHubUsernameBanner
          onAddUsername={() => {
            setEditMode(true);
            setTimeout(() => {
              githubUsernameRef.current?.focus();
              githubUsernameRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 100);
          }}
        />
      )}

      {/* Account Overview Section */}
      <div className="border rounded-lg p-6 bg-background shadow-sm">
        <h3 className="text-lg font-medium mb-4">Account Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Account Type</p>
            <p className="text-lg font-semibold">{capitalize(user.role)}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="text-lg font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Connected Accounts</p>
            <div className="flex gap-2 mt-1">
              {user.googleId && (
                <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded">
                  Google
                </span>
              )}
              {user.githubId && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                  GitHub
                </span>
              )}
              {!user.googleId && !user.githubId && (
                <span className="px-2 py-1 text-xs bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300 rounded">
                  Email
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form-like Section */}
      <div className="border rounded-lg p-6 bg-background shadow-sm">
        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Full Name</Label>
            <Input
              name="fullname"
              value={formData.fullname || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user.email} disabled />
          </div>
          <div>
            <Label>GitHub Username</Label>
            <Input
              ref={githubUsernameRef}
              name="githubUsername"
              value={formData.githubUsername || ""}
              onChange={handleChange}
              disabled={!editMode || !!user.githubId}
              placeholder={user.githubId ? "Auto-filled from GitHub" : "Enter your GitHub username"}
              className={
                !user.githubUsername && editMode ? "ring-2 ring-orange-500 ring-offset-2" : ""
              }
            />
            {user.githubId && (
              <p className="text-xs text-muted-foreground mt-1">✓ Verified via GitHub OAuth</p>
            )}
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              name="phoneNumber"
              value={formData.phoneNumber || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Address</Label>
            <Input
              name="address"
              value={formData.address || ""}
              onChange={handleChange}
              disabled={!editMode}
            />
          </div>
          <div className="md:col-span-2">
            <Label>Wallet Address (for blockchain credentials)</Label>
            <Input
              name="walletAddress"
              value={formData.walletAddress || ""}
              onChange={handleChange}
              disabled={!editMode}
              placeholder="0x..."
            />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={capitalize(user.role)} disabled />
          </div>
          <div>
            <Label>Joined</Label>
            <Input value={new Date(user.createdAt).toLocaleDateString()} disabled />
          </div>
        </form>

        <div className="mt-6 flex justify-end gap-3">
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
        </div>
      </div>
      {/* Email Notifications Section */}
      <div className="border rounded-lg p-6 bg-background shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Email Notifications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose which emails you'd like to receive from en-git
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Weekly Progress Report</p>
              <p className="text-sm text-muted-foreground">
                Get a summary of your GitHub activity every week
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailPreferences?.weeklyReport ?? false}
                onChange={(e) => handleEmailPreferenceChange("weeklyReport", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Score Change Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when your en-git score changes significantly
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailPreferences?.scoreAlerts ?? false}
                onChange={(e) => handleEmailPreferenceChange("scoreAlerts", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Achievement Unlocked</p>
              <p className="text-sm text-muted-foreground">
                Celebrate when you unlock new achievements
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailPreferences?.achievements ?? false}
                onChange={(e) => handleEmailPreferenceChange("achievements", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Leaderboard Position Changes</p>
              <p className="text-sm text-muted-foreground">
                Know when your rank on the leaderboard changes
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.emailPreferences?.leaderboardUpdates ?? false}
                onChange={(e) =>
                  handleEmailPreferenceChange("leaderboardUpdates", e.target.checked)
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Locked Achievements Section */}
      {user?.githubUsername && <LockedAchievements username={user.githubUsername} />}

      {/* Credential Badges Section */}
      {user?.credentialBadges?.length ? (
        <div className="border rounded-lg p-6 bg-background shadow-sm">
          <h3 className="text-lg font-medium mb-4">Blockchain Credentials</h3>
          <div className="space-y-3">
            {user.credentialBadges.map((b, i) => (
              <div
                key={i}
                className="text-sm flex items-center justify-between gap-4 p-3 border rounded"
              >
                <div className="truncate">
                  <div className="font-medium">{b.badgeId}</div>
                  <div className="text-muted-foreground truncate">Token: {b.tokenId || "-"}</div>
                  <div className="text-muted-foreground truncate">Tx: {b.txHash || "-"}</div>
                </div>
                <a
                  className="text-primary underline text-xs"
                  href={getExplorerUrl(b.chainId, b.txHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
