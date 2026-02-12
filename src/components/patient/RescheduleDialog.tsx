import { useState, useEffect, useMemo } from 'react';
import { format, addDays, setHours, setMinutes, isBefore, startOfDay } from 'date-fns';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { AppointmentWithDoctor } from '@/hooks/usePatientData';

interface RescheduleDialogProps {
  appointment: AppointmentWithDoctor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReschedule: (appointmentId: string, newDateTime: Date) => Promise<void>;
}

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  dateTime: Date;
  available: boolean;
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

export const RescheduleDialog = ({
  appointment,
  open,
  onOpenChange,
  onReschedule,
}: RescheduleDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<{ date_time: string }[]>([]);

  useEffect(() => {
    if (open && appointment.doctor.id) {
      fetchDoctorAvailability();
    }
  }, [open, appointment.doctor.id]);

  const fetchDoctorAvailability = async () => {
    setLoading(true);
    try {
      // Fetch doctor's availability slots
      const { data: doctorData } = await supabase
        .from('doctors')
        .select('availability_slots')
        .eq('id', appointment.doctor.id)
        .single();

      if (doctorData?.availability_slots && Array.isArray(doctorData.availability_slots)) {
        setAvailabilitySlots(doctorData.availability_slots as unknown as AvailabilitySlot[]);
      }

      // Fetch existing appointments for this doctor
      const today = startOfDay(new Date());
      const nextWeek = addDays(today, 8);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('date_time')
        .eq('doctor_id', appointment.doctor.id)
        .eq('status', 'scheduled')
        .neq('id', appointment.id) // Exclude current appointment
        .gte('date_time', today.toISOString())
        .lt('date_time', nextWeek.toISOString());

      setExistingAppointments(appointments || []);
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = useMemo(() => {
    if (!availabilitySlots.length) return [];

    const slots: TimeSlot[] = [];
    const today = new Date();
    const now = new Date();

    for (let d = 1; d <= 7; d++) {
      const date = addDays(today, d);
      const dayOfWeek = date.getDay();
      const dayName = Object.keys(DAYS_MAP).find((key) => DAYS_MAP[key] === dayOfWeek);

      const daySlots = availabilitySlots.filter((s) => s.day === dayName);

      daySlots.forEach((slot) => {
        const [startHour] = slot.startTime.split(':').map(Number);
        const [endHour] = slot.endTime.split(':').map(Number);

        for (let hour = startHour; hour < endHour; hour++) {
          const slotDateTime = setMinutes(setHours(date, hour), 0);

          if (isBefore(slotDateTime, now)) continue;

          const dateStr = format(date, 'EEE, MMM d');
          const timeStr = format(slotDateTime, 'h:mm a');

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
            id: `${format(date, 'yyyy-MM-dd')}-${hour}`,
            date: dateStr,
            time: timeStr,
            dateTime: slotDateTime,
            available: !isBooked,
          });
        }
      });
    }

    return slots;
  }, [availabilitySlots, existingAppointments]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {};
    timeSlots.forEach((slot) => {
      if (!groups[slot.date]) {
        groups[slot.date] = [];
      }
      groups[slot.date].push(slot);
    });
    return groups;
  }, [timeSlots]);

  const handleReschedule = async () => {
    if (!selectedSlot) return;
    
    setSubmitting(true);
    try {
      await onReschedule(appointment.id, selectedSlot.dateTime);
      onOpenChange(false);
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new time slot for your appointment with Dr. {appointment.doctor.full_name}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No available time slots found for the next 7 days.
          </div>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              {Object.entries(groupedSlots).map(([date, slots]) => (
                <div key={date}>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{date}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? 'default' : 'outline'}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={!selectedSlot || submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
