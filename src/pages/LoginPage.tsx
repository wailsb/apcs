import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Role } from "@/lib/types";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginBackground } from "@/components/LoginBackground";
import portlyLogo from "@/assets/logo.svg";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password || !role) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(username, password, role as Role);
      
      switch (role) {
        case "ADMIN":
          navigate("/admin/dashboard");
          break;
        case "ENTERPRISE":
          navigate("/enterprise");
          break;
        case "MANAGER":
          navigate("/manager/scan");
          break;
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      <LoginBackground />
      
      {/* Left Side - Logo, Title & Description */}
      <div className="flex-1 flex flex-col justify-center px-12 lg:px-20 relative z-10">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <img src={portlyLogo} alt="Portly" className="w-14 h-14" />
            <h1 className="text-5xl font-bold text-foreground">
              Portly
            </h1>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Portly is a modern port operations platform for managing container arrivals, appointments, slot scheduling, and real-time terminal coordination through a clean, productivity-focused interface.
          </p>
        </div>
      </div>
      
      {/* Right Side - Login Card */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-semibold">
                Sign in
              </CardTitle>
              <CardDescription>
                Enter your credentials to access the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 text-sm text-status-not-arrived bg-secondary rounded-md">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(value: Role) => setRole(value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
