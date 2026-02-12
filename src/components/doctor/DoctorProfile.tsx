import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Building2, FileText } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Doctor = Database["public"]["Tables"]["doctors"]["Row"];

interface DoctorProfileProps {
  doctor: Doctor;
}

export const DoctorProfile = ({ doctor }: DoctorProfileProps) => {
  const initials = doctor.full_name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          Profile
        </CardTitle>
        <CardDescription>Your professional information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={doctor.avatar_url || undefined} alt={doctor.full_name} />
            <AvatarFallback className="text-lg bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h3 className="text-xl font-semibold">{doctor.full_name}</h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                {doctor.specialty}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {doctor.department}
              </Badge>
            </div>
            {doctor.bio && (
              <p className="text-sm text-muted-foreground flex items-start gap-2 mt-3">
                <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {doctor.bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
