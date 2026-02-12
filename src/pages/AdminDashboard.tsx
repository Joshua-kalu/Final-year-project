import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminStats from "@/components/admin/AdminStats";
import UsersManager from "@/components/admin/UsersManager";
import DoctorsManager from "@/components/admin/DoctorsManager";
import DepartmentsOverview from "@/components/admin/DepartmentsOverview";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAdminData } from "@/hooks/useAdminData";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { users, doctors, stats, loading: dataLoading, updateUserRole, deleteDoctor, addDoctor, approveDoctor, rejectDoctor, refetch } = useAdminData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!adminLoading && !isAdmin && user) {
      navigate("/");
    }
  }, [isAdmin, adminLoading, user, navigate]);

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, doctors, and view system analytics
            </p>
          </div>
          <Button
            variant="outline"
            onClick={refetch}
            disabled={dataLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${dataLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            <AdminStats stats={stats} />

            <Tabs defaultValue="pending" className="space-y-4">
              <TabsList>
                <TabsTrigger value="pending" className="relative">
                  Pending Approvals
                  {stats.pendingDoctors > 0 && (
                    <span className="ml-2 bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                      {stats.pendingDoctors}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
                <TabsTrigger value="departments">Departments</TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <DoctorsManager
                  doctors={doctors.filter(d => !d.is_approved)}
                  onDeleteDoctor={deleteDoctor}
                  onAddDoctor={addDoctor}
                  onApproveDoctor={approveDoctor}
                  onRejectDoctor={rejectDoctor}
                  mode="pending"
                />
              </TabsContent>

              <TabsContent value="users">
                <UsersManager users={users} onUpdateRole={updateUserRole} />
              </TabsContent>

              <TabsContent value="doctors">
                <DoctorsManager
                  doctors={doctors.filter(d => d.is_approved)}
                  onDeleteDoctor={deleteDoctor}
                  onAddDoctor={addDoctor}
                  onApproveDoctor={approveDoctor}
                  onRejectDoctor={rejectDoctor}
                  mode="approved"
                />
              </TabsContent>

              <TabsContent value="departments">
                <DepartmentsOverview doctors={doctors.filter(d => d.is_approved)} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
