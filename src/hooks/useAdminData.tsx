import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  role: string;
}

interface Doctor {
  id: string;
  user_id: string | null;
  full_name: string;
  specialty: string;
  department: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  is_approved: boolean;
}

interface Stats {
  totalUsers: number;
  totalDoctors: number;
  pendingDoctors: number;
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}

export const useAdminData = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch profiles with roles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profilesData || []).map((profile) => {
        const userRole = rolesData?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          full_name: profile.full_name,
          phone: profile.phone,
          created_at: profile.created_at,
          role: userRole?.role || "patient",
        };
      });

      setUsers(usersWithRoles);

      // Fetch doctors
      const { data: doctorsData, error: doctorsError } = await supabase
        .from("doctors")
        .select("*")
        .order("created_at", { ascending: false });

      if (doctorsError) throw doctorsError;
      setDoctors(doctorsData || []);

      // Fetch appointment stats
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("status");

      if (appointmentsError) throw appointmentsError;

      const appointments = appointmentsData || [];
      const doctorsList = doctorsData || [];
      setStats({
        totalUsers: usersWithRoles.length,
        totalDoctors: doctorsList.length,
        pendingDoctors: doctorsList.filter((d) => !d.is_approved).length,
        totalAppointments: appointments.length,
        scheduledAppointments: appointments.filter((a) => a.status === "scheduled").length,
        completedAppointments: appointments.filter((a) => a.status === "completed").length,
        cancelledAppointments: appointments.filter((a) => a.status === "cancelled").length,
      });
    } catch (error) {
      logger.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch admin data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateUserRole = async (userId: string, newRole: "admin" | "doctor" | "patient") => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });

      fetchData();
    } catch (error) {
      logger.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const deleteDoctor = async (doctorId: string) => {
    try {
      const { error } = await supabase.from("doctors").delete().eq("id", doctorId);

      if (error) throw error;

      toast({
        title: "Doctor Removed",
        description: "Doctor has been removed successfully.",
      });

      fetchData();
    } catch (error) {
      logger.error("Error deleting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to remove doctor.",
        variant: "destructive",
      });
    }
  };

  const addDoctor = async (doctor: {
    full_name: string;
    specialty: string;
    department: string;
    bio?: string;
  }) => {
    try {
      const { error } = await supabase.from("doctors").insert({
        full_name: doctor.full_name,
        specialty: doctor.specialty,
        department: doctor.department,
        bio: doctor.bio || null,
        is_approved: true, // Doctors added by admin are auto-approved
        availability_slots: [
          { day: "Monday", startTime: "09:00", endTime: "17:00" },
          { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
          { day: "Friday", startTime: "09:00", endTime: "17:00" },
        ],
      });

      if (error) throw error;

      toast({
        title: "Doctor Added",
        description: "New doctor has been added successfully.",
      });

      fetchData();
    } catch (error) {
      logger.error("Error adding doctor:", error);
      toast({
        title: "Error",
        description: "Failed to add doctor.",
        variant: "destructive",
      });
    }
  };

  const approveDoctor = async (doctorId: string) => {
    try {
      const { error } = await supabase
        .from("doctors")
        .update({ is_approved: true })
        .eq("id", doctorId);

      if (error) throw error;

      toast({
        title: "Doctor Approved",
        description: "Doctor has been approved and can now access the platform.",
      });

      fetchData();
    } catch (error) {
      logger.error("Error approving doctor:", error);
      toast({
        title: "Error",
        description: "Failed to approve doctor.",
        variant: "destructive",
      });
    }
  };

  const rejectDoctor = async (doctorId: string) => {
    try {
      // Get the doctor's user_id first
      const { data: doctor } = await supabase
        .from("doctors")
        .select("user_id")
        .eq("id", doctorId)
        .single();

      // Delete the doctor record
      const { error: deleteError } = await supabase
        .from("doctors")
        .delete()
        .eq("id", doctorId);

      if (deleteError) throw deleteError;

      // If they had a user_id, also update their role to patient
      if (doctor?.user_id) {
        await supabase
          .from("user_roles")
          .update({ role: "patient" })
          .eq("user_id", doctor.user_id);
      }

      toast({
        title: "Doctor Rejected",
        description: "Doctor application has been rejected.",
      });

      fetchData();
    } catch (error) {
      logger.error("Error rejecting doctor:", error);
      toast({
        title: "Error",
        description: "Failed to reject doctor.",
        variant: "destructive",
      });
    }
  };

  return {
    users,
    doctors,
    stats,
    loading,
    updateUserRole,
    deleteDoctor,
    addDoctor,
    approveDoctor,
    rejectDoctor,
    refetch: fetchData,
  };
};
