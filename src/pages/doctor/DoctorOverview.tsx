import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { useDoctorData } from "@/hooks/useDoctorData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

const DoctorOverview = () => {
  const { doctor, appointments } = useDoctorData();

  const todayAppointments = appointments.filter(
    (apt) => format(new Date(apt.date_time), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date_time) > new Date() && apt.status === "scheduled"
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Upcoming",
      value: upcomingAppointments.length,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Total Patients",
      value: new Set(appointments.map((a) => a.patient_id)).size,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Completed",
      value: completedAppointments.length,
      icon: CheckCircle,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {doctor?.full_name?.split(" ")[0]}</h1>
          <p className="text-muted-foreground">Here's an overview of your practice</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {todayAppointments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Patient Appointment</p>
                        <p className="text-sm text-muted-foreground">{apt.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{format(new Date(apt.date_time), "h:mm a")}</p>
                      <p className="text-sm text-muted-foreground capitalize">{apt.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {todayAppointments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No appointments today</p>
              <p className="text-muted-foreground">Enjoy your day or check upcoming appointments</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorOverview;
