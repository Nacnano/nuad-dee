import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    const success = await login(email, password);

    if (success) {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in",
        variant: "default",
      });
      navigate("/");
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Try one of the demo accounts.",
        variant: "destructive",
      });
    }
  };

  const demoAccounts = [
    { email: "sarah@example.com", role: "Customer", avatar: "👩‍💼" },
    { email: "david@therapist.com", role: "Therapist", avatar: "👨‍⚕️" },
    { email: "admin@nueddee.com", role: "Admin", avatar: "👨‍💻" },
  ];

  const quickLogin = (email: string) => {
    setEmail(email);
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-soft">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-gradient-healing p-3 rounded-2xl shadow-healing">
              <Heart className="h-8 w-8 text-healing-foreground" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gradient-primary">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Nued Dee account
          </p>
        </div>

        <Card className="shadow-medium border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 transition-all duration-200 focus:shadow-soft"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 transition-all duration-200 focus:shadow-soft"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-healing text-lg py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Demo Accounts
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {demoAccounts.map((account, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => quickLogin(account.email)}
                    className="w-full justify-start hover:bg-card-hover transition-all duration-200"
                    disabled={isLoading}
                  >
                    <span className="mr-3 text-lg">{account.avatar}</span>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{account.role}</span>
                      <span className="text-xs text-muted-foreground">
                        {account.email}
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/services"
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Book a session instead
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
