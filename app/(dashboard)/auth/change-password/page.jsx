"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { post } from "@/lib/api"; // <-- your api.js file
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePassword = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user"));
      const email = user?.email;

      if (!email) {
        toast.error("User not found. Please login again.");
        return;
      }

      const data = await post("/auth/change-password", {
        email,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      if (data.error)
        throw new Error(data.message || "Failed to change password");

      if (data.success) {
        toast.success(data.message);
        router.push("/"); // redirect after success
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 justify-center items-center bg-muted/20 p-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl border border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-center text-sm text-muted-foreground">
            Enter your current password and choose a new one
          </p>
          <form onSubmit={handleSubmit} className="space-y-5">
            {["oldPassword", "newPassword", "confirmPassword"].map((field) => (
              <div key={field} className="relative">
                <Label htmlFor={field} className="font-medium block mb-4">
                  {field === "oldPassword"
                    ? "Current Password"
                    : field === "newPassword"
                    ? "New Password"
                    : "Confirm New Password"}
                </Label>
                <Input
                  id={field}
                  name={field}
                  type={showPassword[field] ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  className="rounded-lg border border-input bg-background px-3 py-2 shadow-sm focus:ring-2 focus:ring-primary pr-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 pt-4 right-2 -translate-y-1/2 text-muted-foreground"
                  onMouseDown={() =>
                    setShowPassword({ ...showPassword, [field]: true })
                  }
                  onMouseUp={() =>
                    setShowPassword({ ...showPassword, [field]: false })
                  }
                  onMouseLeave={() =>
                    setShowPassword({ ...showPassword, [field]: false })
                  }
                >
                  <Eye size={18} />
                </button>
              </div>
            ))}

            <Button
              type="submit"
              className="w-full py-2 mt-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-md"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>

          {/* Forgot password link */}
          {/* <div className="mt-4 text-center">
            <Link
              href="/forget-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
