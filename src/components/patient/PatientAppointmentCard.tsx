import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, MapPin, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AppointmentWithDoctor } from '@/hooks/usePatientData';
import { RescheduleDialog } from './RescheduleDialog';

interface PatientAppointmentCardProps {
  appointment: AppointmentWithDoctor;
  onCancel?: (id: string) => void;
  onReschedule?: (appointmentId: string, newDateTime: Date) => Promise<void>;
  showCancelButton?: boolean;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const PatientAppointmentCard = ({ 
  appointment, 
  onCancel,
  onReschedule,
  showCancelButton = false 
}: PatientAppointmentCardProps) => {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const appointmentDate = new Date(appointment.date_time);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={appointment.doctor.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {appointment.doctor.full_name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-foreground">
                  Dr. {appointment.doctor.full_name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {appointment.doctor.specialty}
                </p>
              </div>
              <Badge className={statusColors[appointment.status] || statusColors.scheduled}>
                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
              </Badge>
            </div>
            
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{format(appointmentDate, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{format(appointmentDate, 'h:mm a')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{appointment.department}</span>
              </div>
            </div>

            {appointment.notes && (
              <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                {appointment.notes}
              </p>
            )}

            {showCancelButton && (
              <div className="mt-3 flex gap-2">
                {onReschedule && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setRescheduleOpen(true)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                    <RescheduleDialog
                      appointment={appointment}
                      open={rescheduleOpen}
                      onOpenChange={setRescheduleOpen}
                      onReschedule={onReschedule}
                    />
                  </>
                )}
                {onCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        Cancel Appointment
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to cancel your appointment with Dr. {appointment.doctor.full_name} on {format(appointmentDate, 'MMMM d, yyyy')} at {format(appointmentDate, 'h:mm a')}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onCancel(appointment.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Cancel Appointment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
