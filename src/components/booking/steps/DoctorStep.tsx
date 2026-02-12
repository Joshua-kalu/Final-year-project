import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BookingDoctor } from "@/hooks/useBooking";

interface DoctorStepProps {
  doctors: BookingDoctor[];
  selected: BookingDoctor | null;
  onSelect: (doctor: BookingDoctor) => void;
  loading?: boolean;
}

const DoctorStep = ({ doctors, selected, onSelect, loading }: DoctorStepProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading doctors...</p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">No Doctors Available</h2>
        <p className="text-muted-foreground">
          No doctors are currently available in this department. Please try another department or check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Choose Your Doctor</h2>
      <p className="text-muted-foreground mb-6">Select a specialist from our team</p>

      <div className="space-y-4">
        {doctors.map((doctor) => {
          const initials = doctor.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

          return (
            <button
              key={doctor.id}
              onClick={() => onSelect(doctor)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                selected?.id === doctor.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-secondary/50"
              }`}
            >
              <Avatar className="h-14 w-14">
                <AvatarImage src={doctor.avatar} alt={doctor.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                {doctor.bio && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{doctor.bio}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DoctorStep;
