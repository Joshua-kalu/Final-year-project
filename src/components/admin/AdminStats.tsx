import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog, Calendar, CheckCircle, XCircle, Clock, UserPlus } from "lucide-react";

interface StatsProps {
  stats: {
    totalUsers: number;
    totalDoctors: number;
    pendingDoctors: number;
    totalAppointments: number;
    scheduledAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
  };
}

const AdminStats = ({ stats }: StatsProps) => {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Approved Doctors",
      value: stats.totalDoctors - stats.pendingDoctors,
      icon: UserCog,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Pending Doctors",
      value: stats.pendingDoctors,
      icon: UserPlus,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      highlight: stats.pendingDoctors > 0,
    },
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: Calendar,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Completed",
      value: stats.completedAppointments,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Cancelled",
      value: stats.cancelledAppointments,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card 
          key={stat.title} 
          className={`border-border ${(stat as any).highlight ? "ring-2 ring-amber-500/50" : ""}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
