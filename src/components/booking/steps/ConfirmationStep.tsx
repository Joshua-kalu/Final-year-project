import { Calendar, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LucideIcon } from "lucide-react";
import type { BookingDoctor, TimeSlot } from "@/hooks/useBooking";

interface Department {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

interface BookingData {
  department: string | null;
  doctor: BookingDoctor | null;
  timeSlot: TimeSlot | null;
}

interface ConfirmationStepProps {
  bookingData: BookingData;
  departments: Department[];
}

const ConfirmationStep = ({ bookingData, departments }: ConfirmationStepProps) => {
  const department = departments.find((d) => d.id === bookingData.department);

  const doctorInitials = bookingData.doctor?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Review Your Booking</h2>
          <p className="text-muted-foreground">Please confirm your appointment details</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Department */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${department?.color}`}>
            {department && <department.icon className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-semibold text-foreground">{department?.name}</p>
          </div>
        </div>

        {/* Doctor */}
        {bookingData.doctor && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={bookingData.doctor.avatar} alt={bookingData.doctor.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {doctorInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Doctor</p>
              <p className="font-semibold text-foreground">{bookingData.doctor.name}</p>
              <p className="text-sm text-muted-foreground">{bookingData.doctor.specialty}</p>
            </div>
          </div>
        )}

        {/* Time Slot */}
        {bookingData.timeSlot && (
          <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date & Time</p>
              <p className="font-semibold text-foreground">
                {bookingData.timeSlot.date} at {bookingData.timeSlot.time}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/5">
        <p className="text-sm text-muted-foreground">
          By confirming this booking, you agree to our cancellation policy. You will receive a confirmation with further instructions.
        </p>
      </div>
    </div>
  );
};

export default ConfirmationStep;
