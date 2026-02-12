import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { DoctorSidebar } from "./DoctorSidebar";
import { useDoctorData } from "@/hooks/useDoctorData";
import { useIsDoctor } from "@/hooks/useIsDoctor";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DoctorLayoutProps {
  children: ReactNode;
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isDoctor, loading: roleLoading } = useIsDoctor();
  const { doctor, loading } = useDoctorData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Redirect non-doctors to home
  useEffect(() => {
    if (!authLoading && !roleLoading && user && !isDoctor) {
      navigate("/");
    }
  }, [user, authLoading, roleLoading, isDoctor, navigate]);

  if (authLoading || loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is not a doctor, show nothing (redirect will happen)
  if (!isDoctor) {
    return null;
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center text-center max-w-md px-4">
          <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            This dashboard is only available for registered doctors.
          </p>
          <Button onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  if (!doctor.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center text-center max-w-md px-4">
          <div className="h-20 w-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Pending Approval</h2>
          <p className="text-muted-foreground mb-4">
            Your registration is under review. You'll be notified once approved.
          </p>
          <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-muted-foreground font-medium mb-2">Once approved, you can:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Set your availability schedule</li>
              <li>View and manage appointments</li>
              <li>Update your professional profile</li>
            </ul>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>Return Home</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DoctorSidebar
          doctorName={doctor.full_name}
          doctorAvatar={doctor.avatar_url}
          specialty={doctor.specialty}
        />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
