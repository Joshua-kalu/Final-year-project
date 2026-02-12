import { motion } from "framer-motion";
import { Calendar, MessageCircle, Clock, Shield, Users, Activity } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Book appointments in just a few clicks with our intuitive booking wizard.",
  },
  {
    icon: MessageCircle,
    title: "AI Assistant",
    description: "Get help finding the right department with our intelligent virtual assistant.",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Receive instant notifications about your appointments and schedule changes.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health information is protected with enterprise-grade security.",
  },
  {
    icon: Users,
    title: "Top Specialists",
    description: "Access to a network of highly qualified doctors across all specialties.",
  },
  {
    icon: Activity,
    title: "Health Tracking",
    description: "Keep track of your medical history and upcoming appointments in one place.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Medicare?
          </h2>
          <p className="text-muted-foreground">
            We combine cutting-edge technology with compassionate care to deliver the best healthcare experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
