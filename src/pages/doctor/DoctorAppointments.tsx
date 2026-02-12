import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { AppointmentsList } from "@/components/doctor/AppointmentsList";
import { useDoctorData } from "@/hooks/useDoctorData";

const DoctorAppointments = () => {
  const { appointments, updateAppointmentStatus, updating } = useDoctorData();

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your patient appointments</p>
        </div>

        <AppointmentsList
          appointments={appointments}
          onUpdateStatus={updateAppointmentStatus}
          updating={updating}
        />
      </div>
    </DoctorLayout>
  );
};

export default DoctorAppointments;
