import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { Database, Json } from "@/integrations/supabase/types";

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AppointmentWithPatient extends Appointment {
  patient?: Profile;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export const useDoctorData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch doctor profile
  const fetchDoctorProfile = async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (error) {
      logger.error("Error fetching doctor profile:", error);
      return null;
    }
    
    return data;
  };

  // Fetch appointments with patient info
  const fetchAppointments = async (doctorId: string) => {
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .eq("doctor_id", doctorId)
      .order("date_time", { ascending: true });

    if (appointmentsError) {
      logger.error("Error fetching appointments:", appointmentsError);
      return [];
    }

    // Fetch patient profiles for each appointment
    const patientIds = [...new Set(appointmentsData.map(a => a.patient_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", patientIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    
    return appointmentsData.map(appointment => ({
      ...appointment,
      patient: profileMap.get(appointment.patient_id),
    }));
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    setUpdating(true);
    
    const updateData: { status: string; notes?: string } = { status };
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const { error } = await supabase
      .from("appointments")
      .update(updateData)
      .eq("id", appointmentId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update appointment status.",
      });
      setUpdating(false);
      return false;
    }

    // Refresh appointments
    if (doctor) {
      const updated = await fetchAppointments(doctor.id);
      setAppointments(updated);
    }

    toast({
      title: "Success",
      description: "Appointment updated successfully.",
    });
    setUpdating(false);
    return true;
  };

  // Update availability slots
  const updateAvailability = async (slots: AvailabilitySlot[]) => {
    if (!doctor) return false;
    setUpdating(true);

    const { error } = await supabase
      .from("doctors")
      .update({ availability_slots: slots as unknown as Json })
      .eq("id", doctor.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update availability.",
      });
      setUpdating(false);
      return false;
    }

    setDoctor({ ...doctor, availability_slots: slots as unknown as Json });
    toast({
      title: "Success",
      description: "Availability updated successfully.",
    });
    setUpdating(false);
    return true;
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const doctorProfile = await fetchDoctorProfile();
      setDoctor(doctorProfile);
      
      if (doctorProfile) {
        const appointmentsList = await fetchAppointments(doctorProfile.id);
        setAppointments(appointmentsList);
      }
      
      setLoading(false);
    };

    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    doctor,
    appointments,
    loading,
    updating,
    updateAppointmentStatus,
    updateAvailability,
    refetch: async () => {
      if (doctor) {
        const updated = await fetchAppointments(doctor.id);
        setAppointments(updated);
      }
    },
  };
};
