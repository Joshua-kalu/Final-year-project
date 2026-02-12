import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { AvailabilityManager } from "@/components/doctor/AvailabilityManager";
import { useDoctorData } from "@/hooks/useDoctorData";

const DoctorAvailability = () => {
  const { doctor, updateAvailability, updating } = useDoctorData();

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Availability</h1>
          <p className="text-muted-foreground">Set your working hours and availability</p>
        </div>

        <div className="max-w-2xl">
          <AvailabilityManager
            initialSlots={doctor?.availability_slots}
            onSave={updateAvailability}
            updating={updating}
          />
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorAvailability;
