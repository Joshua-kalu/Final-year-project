import { LucideIcon } from "lucide-react";

interface Department {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

interface DepartmentStepProps {
  departments: Department[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const DepartmentStep = ({ departments, selected, onSelect }: DepartmentStepProps) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Select Department</h2>
      <p className="text-muted-foreground mb-6">Choose the medical specialty you need</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => onSelect(dept.id)}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
              selected === dept.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30 hover:bg-secondary/50"
            }`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${dept.color}`}>
              <dept.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{dept.name}</h3>
              <p className="text-sm text-muted-foreground">{dept.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DepartmentStep;
