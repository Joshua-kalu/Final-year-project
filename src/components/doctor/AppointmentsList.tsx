import { useState } from "react";
import { format, isPast, isToday } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { AppointmentWithPatient } from "@/hooks/useDoctorData";

interface AppointmentsListProps {
  appointments: AppointmentWithPatient[];
  onUpdateStatus: (id: string, status: string, notes?: string) => Promise<boolean>;
  updating: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/20",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export const AppointmentsList = ({ appointments, onUpdateStatus, updating }: AppointmentsListProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithPatient | null>(null);
  const [notes, setNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const todayAppointments = appointments.filter(a => isToday(new Date(a.date_time)) && a.status === "scheduled");
  const upcomingAppointments = appointments.filter(a => !isPast(new Date(a.date_time)) && !isToday(new Date(a.date_time)) && a.status === "scheduled");
  const pastAppointments = appointments.filter(a => isPast(new Date(a.date_time)) || a.status !== "scheduled");

  const handleOpenDialog = (appointment: AppointmentWithPatient) => {
    setSelectedAppointment(appointment);
    setNotes(appointment.notes || "");
    setNewStatus(appointment.status);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedAppointment) return;
    const success = await onUpdateStatus(selectedAppointment.id, newStatus, notes);
    if (success) {
      setDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  const AppointmentCard = ({ appointment }: { appointment: AppointmentWithPatient }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleOpenDialog(appointment)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="font-medium truncate">
                {appointment.patient?.full_name || "Unknown Patient"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(appointment.date_time), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(appointment.date_time), "h:mm a")}
              </span>
            </div>
            <Badge variant="outline" className="mt-2">
              {appointment.department}
            </Badge>
          </div>
          <Badge className={statusColors[appointment.status]}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
        {appointment.notes && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{appointment.notes}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const AppointmentSection = ({ title, items, emptyMessage }: { title: string; items: AppointmentWithPatient[]; emptyMessage: string }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">{emptyMessage}</p>
      ) : (
        <div className="grid gap-3">
          {items.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Appointments
          </CardTitle>
          <CardDescription>View and manage your patient appointments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AppointmentSection 
            title="Today" 
            items={todayAppointments} 
            emptyMessage="No appointments scheduled for today"
          />
          <AppointmentSection 
            title="Upcoming" 
            items={upcomingAppointments} 
            emptyMessage="No upcoming appointments"
          />
          <AppointmentSection 
            title="Past & Completed" 
            items={pastAppointments.slice(0, 10)} 
            emptyMessage="No past appointments"
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <>
                  {selectedAppointment.patient?.full_name} - {format(new Date(selectedAppointment.date_time), "MMMM d, yyyy 'at' h:mm a")}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this appointment..."
                rows={4}
              />
            </div>
            {selectedAppointment?.patient && (
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="text-sm font-medium">Patient Information</p>
                <p className="text-sm text-muted-foreground">{selectedAppointment.patient.full_name}</p>
                {selectedAppointment.patient.phone && (
                  <p className="text-sm text-muted-foreground">Phone: {selectedAppointment.patient.phone}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
