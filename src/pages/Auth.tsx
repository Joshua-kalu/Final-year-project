import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Heart, Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, Loader2, 
  Stethoscope, UserCircle, ShieldCheck, Sparkles, Building2, Award, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserRole, DoctorSignupData } from "@/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEPARTMENTS = [
  { id: "cardiology", name: "Cardiology" },
  { id: "neurology", name: "Neurology" },
  { id: "orthopedics", name: "Orthopedics" },
  { id: "pediatrics", name: "Pediatrics" },
  { id: "ophthalmology", name: "Ophthalmology" },
  { id: "general medicine", name: "General Medicine" },
  { id: "dermatology", name: "Dermatology" },
  { id: "psychiatry", name: "Psychiatry" },
  { id: "radiology", name: "Radiology" },
  { id: "surgery", name: "Surgery" },
];

type AuthMode = "patient" | "doctor" | "admin";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") as AuthMode | null;
  
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode === "admin" ? "admin" : "patient");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    specialty: "",
    bio: "",
  });
  const { toast } = useToast();
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (!isLogin && !formData.fullName) {
      toast({
        title: "Missing name",
        description: "Please enter your full name.",
        variant: "destructive",
      });
      return false;
    }

    // Doctor-specific validation
    if (!isLogin && authMode === "doctor") {
      if (!formData.department) {
        toast({
          title: "Missing department",
          description: "Please select your department.",
          variant: "destructive",
        });
        return false;
      }
      if (!formData.specialty) {
        toast({
          title: "Missing specialty",
          description: "Please enter your specialty.",
          variant: "destructive",
        });
        return false;
      }
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password. Please try again."
              : error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          // Redirect based on mode
          if (authMode === "doctor") {
            navigate("/doctor");
          } else if (authMode === "admin") {
            navigate("/admin");
          } else {
            navigate("/my-appointments");
          }
        }
      } else {
        // Sign up - admin can only be created via database, not signup
        if (authMode === "admin") {
          toast({
            title: "Not allowed",
            description: "Admin accounts cannot be created through signup.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const role: UserRole = authMode === "doctor" ? "doctor" : "patient";
        const doctorData: DoctorSignupData | undefined = authMode === "doctor" 
          ? { 
              department: formData.department, 
              specialty: formData.specialty, 
              bio: formData.bio || undefined 
            } 
          : undefined;
        const { error } = await signUp(formData.email, formData.password, formData.fullName, role, formData.phone, doctorData);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: authMode === "doctor" 
              ? "Welcome to Medicare. Set up your availability to start accepting appointments." 
              : "Welcome to Medicare. You can now book appointments.",
          });
          navigate(authMode === "doctor" ? "/doctor" : "/my-appointments");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const modeConfig = {
    patient: {
      icon: UserCircle,
      title: isLogin ? "Patient Sign In" : "Patient Registration",
      subtitle: isLogin 
        ? "Access your appointments and health records" 
        : "Join Medicare to book appointments with specialists",
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      accentColor: "text-emerald-500",
      buttonClass: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
    },
    doctor: {
      icon: Stethoscope,
      title: isLogin ? "Doctor Sign In" : "Doctor Registration",
      subtitle: isLogin 
        ? "Manage your appointments and availability" 
        : "Join Medicare to connect with patients",
      gradient: "from-blue-500 to-indigo-600",
      bgGradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
      accentColor: "text-blue-500",
      buttonClass: "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700",
    },
    admin: {
      icon: ShieldCheck,
      title: "Admin Sign In",
      subtitle: "Access the administration dashboard",
      gradient: "from-purple-500 to-pink-600",
      bgGradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      accentColor: "text-purple-500",
      buttonClass: "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
    },
  };

  const currentConfig = modeConfig[authMode];
  const ModeIcon = currentConfig.icon;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background overflow-hidden">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-8 relative">
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.bgGradient} transition-all duration-700`} />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${currentConfig.gradient} shadow-lg`}>
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Medicare
            </span>
          </Link>

          {/* Role Tabs - Only show Patient and Doctor (Admin is hidden) */}
          {authMode !== "admin" && (
            <div className="flex bg-secondary/50 backdrop-blur-sm rounded-2xl p-1.5 mb-6 border border-border/50">
              <button
                onClick={() => setAuthMode("patient")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                  authMode === "patient"
                    ? "bg-card text-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCircle className="h-4 w-4" />
                Patient
              </button>
              <button
                onClick={() => setAuthMode("doctor")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-300 ${
                  authMode === "doctor"
                    ? "bg-card text-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Stethoscope className="h-4 w-4" />
                Doctor
              </button>
            </div>
          )}

          {/* Form Header */}
          <AnimatePresence mode="wait">
            <motion.div
              key={authMode + isLogin}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${currentConfig.accentColor} bg-current/10`}>
                  <ModeIcon className="h-5 w-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {currentConfig.title}
                </h1>
              </div>
              <p className="text-muted-foreground">{currentConfig.subtitle}</p>
            </motion.div>
          </AnimatePresence>

          {/* Sign In / Sign Up Toggle */}
          {authMode !== "admin" && (
            <div className="flex bg-secondary/50 rounded-xl p-1 mb-6 border border-border/50">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isLogin
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  !isLogin
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {!isLogin && authMode !== "admin" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={authMode === "doctor" ? "Dr. John Smith" : "John Doe"}
                        className="w-full bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 234 567 890"
                        className="w-full bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Doctor-specific fields */}
                  {authMode === "doctor" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Department *</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                          <Select
                            value={formData.department}
                            onValueChange={(value) => setFormData({ ...formData, department: value })}
                            disabled={isLoading}
                          >
                            <SelectTrigger className="w-full bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl pl-12 pr-4 py-3.5 h-auto text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all">
                              <SelectValue placeholder="Select your department" />
                            </SelectTrigger>
                            <SelectContent>
                              {DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Specialty *</label>
                        <div className="relative">
                          <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <input
                            type="text"
                            value={formData.specialty}
                            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                            placeholder="e.g., Cardiac Surgeon, Neurologist"
                            className="w-full bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Bio (Optional)</label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                          <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell patients about your experience and qualifications..."
                            rows={3}
                            className="w-full bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-xl pl-12 pr-12 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className={`w-full ${currentConfig.buttonClass} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <button className="text-primary hover:underline">Terms of Service</button>
            {" "}and{" "}
            <button className="text-primary hover:underline">Privacy Policy</button>
          </p>
        </motion.div>
      </div>

      {/* Right Panel - Decorative */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.gradient}`} />
        
        {/* Animated circles */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-md"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm mb-8 mx-auto shadow-2xl">
              <Heart className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              {authMode === "patient" && "Your Health, Our Priority"}
              {authMode === "doctor" && "Empower Your Practice"}
              {authMode === "admin" && "System Administration"}
            </h2>
            
            <p className="text-white/80 text-lg mb-8">
              {authMode === "patient" && "Book appointments with top specialists, track your health journey, and get AI-powered guidance."}
              {authMode === "doctor" && "Manage your schedule, connect with patients, and grow your practice with Medicare."}
              {authMode === "admin" && "Manage users, monitor system health, and oversee all operations."}
            </p>

            <div className="flex items-center justify-center gap-2 text-white/60">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Trusted by thousands of healthcare professionals</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;