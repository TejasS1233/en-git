import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Camera } from "lucide-react";

export default function UserProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/users/profile/${id}`);
        setUser(res.data.data);
        setFormData(res.data.data);
      } catch (error) {
        toast.error("Failed to load user profile");
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
      "1": "https://etherscan.io", // Ethereum Mainnet
      "11155111": "https://sepolia.etherscan.io", // Sepolia Testnet
      "137": "https://polygonscan.com", // Polygon Mainnet
      "80001": "https://mumbai.polygonscan.com", // Polygon Mumbai Testnet
      "56": "https://bscscan.com", // BSC Mainnet
      "97": "https://testnet.bscscan.com", // BSC Testnet
      "42161": "https://arbiscan.io", // Arbitrum One
      "421614": "https://sepolia.arbiscan.io", // Arbitrum Sepolia
      "10": "https://optimistic.etherscan.io", // Optimism
      "420": "https://sepolia-optimism.etherscan.io", // Optimism Sepolia
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

      {/* Profile Form-like Section */}
      <div className="border rounded-lg p-6 bg-background shadow-sm">
        <h3 className="text-lg font-medium mb-4">Account</h3>
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
      {/* Credential Badges Section */}
      {user?.credentialBadges?.length ? (
        <div className="border rounded-lg p-6 bg-background shadow-sm">
          <h3 className="text-lg font-medium mb-4">Blockchain Credentials</h3>
          <div className="space-y-3">
            {user.credentialBadges.map((b, i) => (
              <div key={i} className="text-sm flex items-center justify-between gap-4 p-3 border rounded">
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
