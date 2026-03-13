import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, tokenStore } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Lock,
  User,
  ClipboardList,
  BarChart3,
  DollarSign,
  ArrowLeft,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.post<TokenResponse>("/api/auth/login", {
        email,
        password,
      });

      tokenStore.set(data.access_token, data.refresh_token);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    }

    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await api.post<TokenResponse>("/api/auth/register", {
        email,
        password,
        full_name: name,
      });

      tokenStore.set(data.access_token, data.refresh_token);
      toast({
        title: "Account created!",
        description: "Welcome to MentorMeter!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message,
      });
    }

    setLoading(false);
  };

  const highlights = [
    {
      icon: ClipboardList,
      title: "Smart Review Tracking",
      description: "Log and organize every mentorship session",
    },
    {
      icon: DollarSign,
      title: "Payment Analytics",
      description: "Auto-calculate your daily and monthly earnings",
    },
    {
      icon: BarChart3,
      title: "PDF Reports",
      description: "Generate professional reports in one click",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Brand & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[hsl(221,83%,53%)] via-[hsl(199,89%,48%)] to-[hsl(173,80%,40%)] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <BrandLogo className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MentorMeter</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
            Your Mentorship
            <br />
            Journey Starts Here
          </h1>
          <p className="text-lg text-white/70 mb-12 max-w-md">
            Track reviews, manage payments, and grow your impact as a mentor — all in one place.
          </p>

          {/* Feature highlights */}
          <div className="space-y-5">
            {highlights.map((item, i) => (
              <div
                key={item.title}
                className="flex items-start gap-4 animate-slide-in-left opacity-0"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 flex-shrink-0">
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="mt-16 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["PS", "RV", "AD", "SK"].map((initials, i) => (
                <div
                  key={initials}
                  className="h-9 w-9 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white backdrop-blur-sm"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              Trusted by <span className="text-white font-semibold">50+ mentors</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-background relative">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        <div className="w-full max-w-md p-8 sm:p-10 bg-card/60 backdrop-blur-2xl border border-border/40 rounded-[2.5rem] shadow-2xl shadow-black/5 animate-fade-in relative overflow-hidden">
          {/* Subtle glow behind form */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <BrandLogo className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">MentorMeter</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              {activeTab === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {activeTab === "login"
                ? "Sign in to continue to your dashboard"
                : "Get started with your free account today"}
            </p>
          </div>

          {/* Tab Toggle */}
          <div className="flex bg-muted rounded-xl p-1 mb-8">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "login"
                ? "bg-background text-foreground shadow-md shadow-black/5 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "signup"
                ? "bg-background text-foreground shadow-md shadow-black/5 scale-[1.02]"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {activeTab === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/40 bg-background/50 focus:bg-background focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/40 bg-background/50 focus:bg-background focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white shadow-lg shadow-primary/25 text-base font-semibold transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          )}

          {/* Signup Form */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignup} className="space-y-5 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/40 bg-background/50 focus:bg-background focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/40 bg-background/50 focus:bg-background focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-border/40 bg-background/50 focus:bg-background focus:border-primary focus:ring-primary/20 transition-all duration-300"
                    required
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-gradient-primary hover:opacity-90 text-white shadow-lg shadow-primary/25 text-base font-semibold transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          {/* Bottom text */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            {activeTab === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setActiveTab("signup")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setActiveTab("login")}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
