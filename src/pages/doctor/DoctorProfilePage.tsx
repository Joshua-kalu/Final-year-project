import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { DoctorProfile as DoctorProfileCard } from "@/components/doctor/DoctorProfile";
import { useDoctorData } from "@/hooks/useDoctorData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Award, FileText, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DoctorProfilePage = () => {
  const { doctor } = useDoctorData();
  const { user } = useAuth();

  return (
    <DoctorLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground">View and manage your professional profile</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            {doctor && <DoctorProfileCard doctor={doctor} />}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Building2 className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium capitalize">{doctor?.department}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Award className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Specialty</p>
                  <p className="font-medium">{doctor?.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Mail className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              {doctor?.bio && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <FileText className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bio</p>
                    <p className="font-medium">{doctor.bio}</p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Badge variant={doctor?.is_approved ? "default" : "secondary"}>
                  {doctor?.is_approved ? "Verified Doctor" : "Pending Verification"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfilePage;
