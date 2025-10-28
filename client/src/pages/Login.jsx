import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/lib/axios";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { Separator } from "@/components/ui/separator";
import { IoEye, IoEyeOff } from "react-icons/io5";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Your session has expired. Please login again.");
    }
  }, [searchParams]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("/users/login", data);
      console.log("Login Success:", res.data);
      setUser(res.data?.data?.user);
      toast.success("Logged in successfully!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      const message = err?.response?.data?.message?.toString?.() || err?.message || "Login failed.";
      if (err?.response?.data?.errors?.length) {
        err.response.data.errors.forEach((e) => {
          toast.error(e?.message?.toString() || "Something went wrong.");
        });
      } else {
        toast.error(message);
      }
      console.error("Login Error:", message, err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/10">
      {/* Boxed login card */}
      <div className="w-full max-w-sm rounded-2xl border bg-card shadow-md p-6 flex flex-col items-center transition-colors">
        <Logo className="h-9 w-9" />
        <p className="mt-4 text-xl font-bold tracking-tight text-center">Log in</p>

        {/* Social buttons */}
        <Button
          className="mt-8 w-full gap-3"
          onClick={() =>
            (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/users/auth/google`)
          }
        >
          <GoogleLogo />
          Continue with Google
        </Button>

        <Button
          className="mt-3 w-full gap-3 bg-[#24292e] text-white hover:bg-[#333]"
          onClick={() =>
            (window.location.href = `${import.meta.env.VITE_API_BASE_URL}/users/auth/github`)
          }
        >
          <GitHubLogo />
          Continue with GitHub
        </Button>

        {/* OR Separator */}
        <div className="my-7 w-full flex items-center justify-center overflow-hidden">
          <Separator />
          <span className="text-sm px-2">OR</span>
          <Separator />
        </div>

        {/* Login form */}
        <Form {...form}>
          <form className="w-full space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password field with toggle */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...field}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="mt-4 w-full">
              Continue with Email
            </Button>
          </form>
        </Form>

        {/* Footer link */}
        <p className="mt-5 text-sm text-center">
          Don't have an account?
          <Link to="/signup" className="ml-1 underline text-muted-foreground">
            Sign Up!
          </Link>
        </p>
      </div>
    </div>
  );
}

/* Logos */
function GoogleLogo() {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0 align-sub text-[inherit]"
    >
      <g clipPath="url(#clip0)">
        <path
          d="M15.6823 8.18368C15.6823 7.63986 15.6382 7.0931 15.5442 6.55811H7.99829V9.63876H12.3194C12.1401 10.6323 11.564 11.5113 10.7203 12.0698V14.0687H13.2983C14.8122 12.6753 15.6823 10.6176 15.6823 8.18368Z"
          fill="#4285F4"
        />
        <path
          d="M7.99812 16C10.1558 16 11.9753 15.2915 13.3011 14.0687L10.7231 12.0698C10.0058 12.5578 9.07988 12.8341 8.00106 12.8341C5.91398 12.8341 4.14436 11.426 3.50942 9.53296H0.849121V11.5936C2.2072 14.295 4.97332 16 7.99812 16Z"
          fill="#34A853"
        />
        <path
          d="M3.50665 9.53295C3.17154 8.53938 3.17154 7.4635 3.50665 6.46993V4.4093H0.849292C-0.285376 6.66982 -0.285376 9.33306 0.849292 11.5936L3.50665 9.53295Z"
          fill="#FBBC04"
        />
        <path
          d="M7.99812 3.16589C9.13867 3.14825 10.241 3.57743 11.067 4.36523L13.3511 2.0812C11.9048 0.723121 9.98526 -0.0235266 7.99812 -1.02057e-05C4.97332 -1.02057e-05 2.2072 1.70493 0.849121 4.40932L3.50648 6.46995C4.13848 4.57394 5.91104 3.16589 7.99812 3.16589Z"
          fill="#EA4335"
        />
      </g>
      <defs>
        <clipPath id="clip0">
          <rect width="15.6825" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

function GitHubLogo() {
  return (
    <svg
      width="1.2em"
      height="1.2em"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="inline-block"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2 .37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.57 7.57 0 012-.27 7.57 7.57 0 012 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.74.54 1.49 0 1.07-.01 1.93-.01 2.19 0 .21.15.45.55.38A8 8 0 008 0z" />
    </svg>
  );
}
