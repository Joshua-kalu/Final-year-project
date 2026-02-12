import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { addDays, format, parse, setHours, setMinutes, isBefore, startOfDay } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];
type Appointment = Database["public"]["Tables"]["appointments"]["Row"];

export interface BookingDoctor {
  id: string;
  name: string;
  specialty: string;
  department: string;
  avatar: string;
  bio: string | null;
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  dateTime: Date;
  available: boolean;
}

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

const DAYS_MAP: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export const useBooking = (selectedDepartment: string | null, selectedDoctorId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<BookingDoctor[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);
  const [selectedDoctorSlots, setSelectedDoctorSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch doctors by department
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!selectedDepartment) {
        setDoctors([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .ilike("department", selectedDepartment)
        .eq("is_approved", true);

      if (error) {
        logger.error("Error fetching doctors:", error);
        setDoctors([]);
      } else {
        setDoctors(
          data.map((d) => ({
            id: d.id,
            name: d.full_name,
            specialty: d.specialty,
            department: d.department.toLowerCase(),
            avatar: d.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${d.full_name}`,
            bio: d.bio,
          }))
        );
      }
      setLoading(false);
    };

    fetchDoctors();
  }, [selectedDepartment]);

  // Fetch doctor's availability and existing appointments
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      if (!selectedDoctorId) {
        setSelectedDoctorSlots([]);
        setExistingAppointments([]);
        return;
      }

      // Fetch doctor's availability slots
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("availability_slots")
        .eq("id", selectedDoctorId)
        .single();

      if (doctorData?.availability_slots && Array.isArray(doctorData.availability_slots)) {
        setSelectedDoctorSlots(doctorData.availability_slots as unknown as AvailabilitySlot[]);
      } else {
        setSelectedDoctorSlots([]);
      }

      // Fetch existing appointments for this doctor in the next 7 days
      const today = startOfDay(new Date());
      const nextWeek = addDays(today, 8);

      const { data: appointments } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", selectedDoctorId)
        .eq("status", "scheduled")
        .gte("date_time", today.toISOString())
        .lt("date_time", nextWeek.toISOString());

      setExistingAppointments(appointments || []);
    };

    fetchDoctorDetails();
  }, [selectedDoctorId]);

  // Generate time slots based on doctor's availability
  const timeSlots = useMemo(() => {
    if (!selectedDoctorSlots.length) return [];

    const slots: TimeSlot[] = [];
    const today = new Date();
    const now = new Date();

    // Generate slots for the next 7 days
    for (let d = 1; d <= 7; d++) {
      const date = addDays(today, d);
      const dayOfWeek = date.getDay();
      const dayName = Object.keys(DAYS_MAP).find((key) => DAYS_MAP[key] === dayOfWeek);

      // Find availability for this day
      const daySlots = selectedDoctorSlots.filter((s) => s.day === dayName);

      daySlots.forEach((slot) => {
        // Skip slots with invalid time data
        if (!slot.startTime || !slot.endTime) return;
        
        // Parse start and end times
        const startParts = slot.startTime.split(":");
        const endParts = slot.endTime.split(":");
        
        if (startParts.length < 2 || endParts.length < 2) return;
        
        const [startHour, startMin] = startParts.map(Number);
        const [endHour, endMin] = endParts.map(Number);
        
        // Skip if parsed values are invalid
        if (isNaN(startHour) || isNaN(endHour)) return;

        // Generate hourly slots
        for (let hour = startHour; hour < endHour; hour++) {
          const slotDateTime = setMinutes(setHours(date, hour), 0);
          
          // Skip if slot is in the past
          if (isBefore(slotDateTime, now)) continue;

          const dateStr = format(date, "EEE, MMM d");
          const timeStr = format(slotDateTime, "h:mm a");

          // Check if this slot is already booked
          const isBooked = existingAppointments.some((apt) => {
            const aptDate = new Date(apt.date_time);
            return (
              aptDate.getFullYear() === slotDateTime.getFullYear() &&
              aptDate.getMonth() === slotDateTime.getMonth() &&
              aptDate.getDate() === slotDateTime.getDate() &&
              aptDate.getHours() === slotDateTime.getHours()
            );
          });

          slots.push({
            id: `${format(date, "yyyy-MM-dd")}-${hour}`,
            date: dateStr,
            time: timeStr,
            dateTime: slotDateTime,
            available: !isBooked,
          });
        }
      });
    }

    return slots;
  }, [selectedDoctorSlots, existingAppointments]);

  // Send email notification - simplified to only pass required data
  const sendEmailNotification = async (
    type: "confirmation" | "cancellation" | "reminder",
    appointmentId: string
  ) => {
    try {
      await supabase.functions.invoke("send-appointment-email", {
        body: {
          type,
          appointmentId,
        },
      });
    } catch (error) {
      logger.error("Failed to send email notification:", error);
      // Don't fail the appointment if email fails
    }
  };

  // Create appointment
  const createAppointment = async (doctorId: string, department: string, dateTime: Date) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to book an appointment.",
      });
      return false;
    }

    setSubmitting(true);

    const { data: appointmentData, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: user.id,
        doctor_id: doctorId,
        department,
        date_time: dateTime.toISOString(),
        status: "scheduled",
      })
      .select("id")
      .single();

    if (error) {
      logger.error("Error creating appointment:", error);
      toast({
        variant: "destructive",
        title: "Booking failed",
        description: "Could not create appointment. Please try again.",
      });
      setSubmitting(false);
      return false;
    }
    
    // Send confirmation email (fire and forget)
    if (appointmentData?.id) {
      sendEmailNotification("confirmation", appointmentData.id);
    }

    toast({
      title: "Appointment booked!",
      description: `Your appointment has been scheduled for ${format(dateTime, "MMMM d, yyyy 'at' h:mm a")}.`,
    });
    setSubmitting(false);
    return true;
  };

  return {
    doctors,
    timeSlots,
    loading,
    submitting,
    createAppointment,
    isAuthenticated: !!user,
  };
};
