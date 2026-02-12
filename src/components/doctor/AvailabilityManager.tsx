import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Trash2, Loader2 } from "lucide-react";
import type { AvailabilitySlot } from "@/hooks/useDoctorData";
import type { Json } from "@/integrations/supabase/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return [`${hour}:00`, `${hour}:30`];
}).flat();

interface AvailabilityManagerProps {
  initialSlots: Json | null;
  onSave: (slots: AvailabilitySlot[]) => Promise<boolean>;
  updating: boolean;
}

export const AvailabilityManager = ({ initialSlots, onSave, updating }: AvailabilityManagerProps) => {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialSlots && Array.isArray(initialSlots)) {
      setSlots(initialSlots as unknown as AvailabilitySlot[]);
    }
  }, [initialSlots]);

  const addSlot = () => {
    setSlots([...slots, { day: "Monday", startTime: "09:00", endTime: "17:00" }]);
    setHasChanges(true);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: string) => {
    const updated = slots.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    setSlots(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    const success = await onSave(slots);
    if (success) {
      setHasChanges(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Availability
        </CardTitle>
        <CardDescription>Set your weekly availability for appointments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {slots.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-4">No availability slots configured</p>
            <Button onClick={addSlot} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Slot
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map((slot, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <Select value={slot.day} onValueChange={(v) => updateSlot(index, "day", v)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-muted-foreground text-sm">from</span>
                
                <Select value={slot.startTime} onValueChange={(v) => updateSlot(index, "startTime", v)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <span className="text-muted-foreground text-sm">to</span>
                
                <Select value={slot.endTime} onValueChange={(v) => updateSlot(index, "endTime", v)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMES.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  onClick={() => removeSlot(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={addSlot} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
          {hasChanges && (
            <Button onClick={handleSave} size="sm" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
