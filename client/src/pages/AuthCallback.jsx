import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
          credentials: "include", // important! sends HTTP-only cookies
        });

        if (!res.ok) throw new Error("Failed to fetch user profile.");

        const data = await res.json();
        setUser(data.user);
        toast.success("Login successful!");
        navigate("/"); // Redirect to home page
      } catch (err) {
        toast.error(err.message);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">Logging you in...</p>;
  return null;
}
