import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-foreground rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm">
              <MessageCircle className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Not Sure Where to Start?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Our AI Virtual Assistant can help you find the right department based on your symptoms. Safe, secure, and always available.
          </p>

          <Link to="/assistant">
            <Button
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg"
            >
              Chat with AI Assistant
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <p className="text-sm text-primary-foreground/60 mt-6">
            ⚠️ For emergencies, please call 112 immediately
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
