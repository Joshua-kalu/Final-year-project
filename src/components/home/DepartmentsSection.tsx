import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Bone, Baby, Eye, Stethoscope, ArrowRight } from "lucide-react";

const departments = [
  {
    icon: Heart,
    name: "Cardiology",
    description: "Heart and cardiovascular system specialists",
    doctors: 8,
    color: "bg-red-100 text-red-600",
  },
  {
    icon: Brain,
    name: "Neurology",
    description: "Brain and nervous system experts",
    doctors: 6,
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Bone,
    name: "Orthopedics",
    description: "Bone and joint care specialists",
    doctors: 10,
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Baby,
    name: "Pediatrics",
    description: "Child health and development",
    doctors: 12,
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Eye,
    name: "Ophthalmology",
    description: "Eye care and vision specialists",
    doctors: 5,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    icon: Stethoscope,
    name: "General Medicine",
    description: "Primary care and general health",
    doctors: 15,
    color: "bg-green-100 text-green-600",
  },
];

const DepartmentsSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Our Departments
            </h2>
            <p className="text-muted-foreground max-w-md">
              Comprehensive care across all major medical specialties
            </p>
          </div>
          <Link to="/booking">
            <Button variant="outline">
              View All Departments
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/booking?department=${dept.name.toLowerCase()}`}
                className="block p-6 rounded-xl bg-card card-shadow hover:card-shadow-hover hover:border-primary/20 border border-transparent transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${dept.color}`}>
                    <dept.icon className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {dept.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{dept.description}</p>
                    <p className="text-xs text-primary font-medium mt-2">{dept.doctors} doctors available</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DepartmentsSection;
