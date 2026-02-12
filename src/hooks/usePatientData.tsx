import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { logger } from '@/lib/logger';

export interface AppointmentWithDoctor {
  id: string;
  date_time: string;
  status: string;
  notes: string | null;
  department: string;
  doctor: {
    id: string;
    full_name: string;
    specialty: string;
    avatar_url: string | null;
  };
}

export const usePatientData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date_time,
          status,
          notes,
          department,
          doctor:doctors!doctor_id (
            id,
            full_name,
            specialty,
            avatar_url
          )
        `)
        .eq('patient_id', user.id)
        .order('date_time', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((apt: any) => ({
        ...apt,
        doctor: apt.doctor || { id: '', full_name: 'Unknown Doctor', specialty: '', avatar_url: null }
      }));

      setAppointments(formattedData);
    } catch (error: any) {
      logger.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId)
        .eq('patient_id', user?.id);

      if (error) throw error;

      // Send cancellation email - only pass type and appointmentId
      try {
        await supabase.functions.invoke("send-appointment-email", {
          body: {
            type: "cancellation",
            appointmentId,
          },
        });
      } catch (emailError) {
        logger.error("Failed to send cancellation email:", emailError);
      }

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully"
      });

      fetchAppointments();
    } catch (error: any) {
      logger.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const upcomingAppointments = appointments.filter(
    apt => new Date(apt.date_time) >= new Date() && apt.status === 'scheduled'
  );

  const pastAppointments = appointments.filter(
    apt => new Date(apt.date_time) < new Date() || apt.status !== 'scheduled'
  );

  const rescheduleAppointment = async (appointmentId: string, newDateTime: Date) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ date_time: newDateTime.toISOString() })
        .eq('id', appointmentId)
        .eq('patient_id', user?.id);

      if (error) throw error;

      // Send reschedule confirmation email - only pass type and appointmentId
      try {
        await supabase.functions.invoke("send-appointment-email", {
          body: {
            type: "confirmation",
            appointmentId,
          },
        });
      } catch (emailError) {
        logger.error("Failed to send reschedule email:", emailError);
      }

      toast({
        title: "Appointment Rescheduled",
        description: "Your appointment has been rescheduled successfully"
      });

      fetchAppointments();
    } catch (error: any) {
      logger.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive"
      });
    }
  };

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    loading,
    cancelAppointment,
    rescheduleAppointment,
    refetch: fetchAppointments
  };
};
