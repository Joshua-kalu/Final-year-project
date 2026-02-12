import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface Doctor {
  id: string;
  department: string;
  full_name: string;
  specialty: string;
}

interface DepartmentsOverviewProps {
  doctors: Doctor[];
}

const DepartmentsOverview = ({ doctors }: DepartmentsOverviewProps) => {
  // Group doctors by department
  const departmentGroups = doctors.reduce((acc, doctor) => {
    if (!acc[doctor.department]) {
      acc[doctor.department] = [];
    }
    acc[doctor.department].push(doctor);
    return acc;
  }, {} as Record<string, Doctor[]>);

  const departments = Object.entries(departmentGroups).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Departments Overview
        </CardTitle>
        <CardDescription>
          View all departments and their assigned doctors
        </CardDescription>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No departments with doctors yet
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {departments.map(([department, deptDoctors]) => (
              <Card key={department} className="border-border bg-secondary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{department}</CardTitle>
                    <Badge variant="secondary">{deptDoctors.length} doctors</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {deptDoctors.map((doctor) => (
                      <li
                        key={doctor.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="font-medium">{doctor.full_name}</span>
                        <span className="text-muted-foreground text-xs">
                          {doctor.specialty}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentsOverview;
