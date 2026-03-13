import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { tokenStore } from "@/lib/api";
import {
  ClipboardList,
  BarChart3,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  DollarSign,
  Calendar,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (tokenStore.isLoggedIn()) {
      navigate("/dashboard");
    } else {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: ClipboardList,
      title: "Review Tracking",
      description:
        "Log every mentorship review with detailed scores, topics, and dates. Never lose track of a session again.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: DollarSign,
      title: "Payment Analytics",
      description:
        "Automatically calculate daily and monthly earnings based on your configured rate per review.",
      color: "from-teal-500 to-cyan-600",
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description:
        "Visualize trends, generate PDF reports, and filter data by date or participant for deep analysis.",
      color: "from-amber-500 to-orange-600",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Create Your Account",
      description: "Sign up in seconds with your email. Get instant access to all features.",
    },
    {
      step: "02",
      title: "Log Your Reviews",
      description: "Record mentorship reviews with mentor names, intern details, topics, and scores.",
    },
    {
      step: "03",
      title: "Track & Earn",
      description: "Monitor your progress, generate reports, and keep track of your earnings effortlessly.",
    },
  ];

  const stats = [
    { value: "500+", label: "Reviews Tracked" },
    { value: "50+", label: "Active Mentors" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "₹10L+", label: "Payments Tracked" },
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Senior Mentor, TechCorp",
      quote: "Mentor Meter transformed how I track my mentorship sessions. The payment tracking alone saves me hours every month.",
      avatar: "PS",
    },
    {
      name: "Rahul Verma",
      role: "Team Lead, InnovateLabs",
      quote: "The PDF report generation is a game-changer. I can share professional reports with management in one click.",
      avatar: "RV",
    },
    {
      name: "Anita Desai",
      role: "Mentor Coordinator, EduTech",
      quote: "Finally, a tool that understands the mentor workflow. Clean interface, powerful features, and incredibly easy to use.",
      avatar: "AD",
    },
  ];

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <BrandLogo className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">MentorMeter</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/auth")}
                className="text-sm font-medium"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90 text-white shadow-lg shadow-primary/25 transition-all"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="w-full justify-center"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 bg-gradient-hero">
        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse-glow [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-400/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
                <BrandLogo className="h-4 w-4" />
                <span>Simplify Your Mentorship Workflow</span>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight animate-fade-in [animation-delay:0.15s] opacity-0">
              Track, Manage &{" "}
              <span className="text-gradient">Grow</span>
              <br />
              Your Mentorship
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:0.3s] opacity-0">
              The all-in-one platform for mentors to log reviews, track payments, and generate professional reports — effortlessly.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:0.45s] opacity-0">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary hover:opacity-90 text-white shadow-xl shadow-primary/30 text-base px-8 h-12 transition-all hover:shadow-2xl hover:shadow-primary/40"
              >
                Start Tracking Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="text-base px-8 h-12 border-2"
              >
                Learn More
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {/* Floating stat badges */}
            <div className="hidden lg:block">
              <div className="absolute left-8 top-1/2 animate-float">
                <div className="glass rounded-2xl px-5 py-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-foreground">₹42K</p>
                      <p className="text-xs text-muted-foreground">This Month</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute right-8 top-1/3 animate-float [animation-delay:2s]">
                <div className="glass rounded-2xl px-5 py-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-blue-600 fill-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold">8.7</p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-muted/20 skew-y-[-2deg] origin-top-left -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Everything You Need to{" "}
              <span className="text-gradient">Succeed</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed specifically for mentors who want to stay organized and maximize their impact.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative rounded-3xl border border-border/40 bg-card/40 backdrop-blur-md p-8 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 overflow-hidden"
              >
                <div
                  className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg shadow-black/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 will-change-transform`}
                >
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-muted/30 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Get Started in{" "}
              <span className="text-gradient">3 Easy Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-primary text-white text-3xl font-bold mb-6 shadow-xl shadow-primary/25 mx-auto">
                  {item.step}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2.5rem] bg-gradient-primary p-12 lg:p-20 shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/15 transition-colors duration-1000" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-white/15 transition-colors duration-1000" />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl sm:text-5xl font-extrabold text-white mb-2">{stat.value}</p>
                  <p className="text-sm sm:text-base text-white/70 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Loved by{" "}
              <span className="text-gradient">Mentors</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              See what mentors are saying about their experience with Mentor Meter.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div
                key={testimonial.name}
                className="rounded-3xl border border-border/40 bg-card/60 backdrop-blur-sm p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 group"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-40 relative overflow-hidden">
        {/* Glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/10 rounded-[100%] blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Ready to{" "}
              <span className="text-gradient">Streamline</span>
              <br />
              Your Mentorship?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join hundreds of mentors who are already saving time and tracking their impact with Mentor Meter.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-primary hover:opacity-90 text-white shadow-xl shadow-primary/30 text-base px-10 h-13 transition-all hover:shadow-2xl hover:shadow-primary/40"
            >
              Get Started — It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free forever
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Setup in 30s
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md">
                <BrandLogo className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gradient">MentorMeter</span>
            </div>

            <div className="flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MentorMeter. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
