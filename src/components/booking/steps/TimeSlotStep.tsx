import { useState, useMemo } from "react";
import { Clock, Loader2 } from "lucide-react";
import type { TimeSlot } from "@/hooks/useBooking";

interface TimeSlotStepProps {
  slots: TimeSlot[];
  selected: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
  loading?: boolean;
}

const TimeSlotStep = ({ slots, selected, onSelect, loading }: TimeSlotStepProps) => {
  const groupedSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {};
    slots.forEach((slot) => {
      if (!groups[slot.date]) groups[slot.date] = [];
      groups[slot.date].push(slot);
    });
    return groups;
  }, [slots]);

  const dates = Object.keys(groupedSlots);
  const [selectedDate, setSelectedDate] = useState(dates[0] || "");

  // Update selected date when dates change
  useMemo(() => {
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading available times...</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">No Available Slots</h2>
        <p className="text-muted-foreground">
          This doctor has no available time slots in the next 7 days. Please select another doctor or check back later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Select Time Slot</h2>
      <p className="text-muted-foreground mb-6">Pick a convenient date and time</p>

      {/* Date Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 -mx-2 px-2">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedDate === date
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {date}
          </button>
        ))}
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {groupedSlots[selectedDate]?.map((slot) => (
          <button
            key={slot.id}
            onClick={() => slot.available && onSelect(slot)}
            disabled={!slot.available}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
              !slot.available
                ? "border-border bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                : selected?.id === slot.id
                ? "border-primary bg-primary/5 text-primary"
                : "border-border hover:border-primary/30 text-foreground"
            }`}
          >
            <Clock className="h-4 w-4" />
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeSlotStep;
