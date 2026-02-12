import { Link } from "react-router-dom";
import { Heart, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Medicare</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner in healthcare scheduling. Book appointments with top specialists easily.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/booking" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Book Appointment
              </Link>
              <Link to="/assistant" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                AI Assistant
              </Link>
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Patient Portal
              </Link>
            </div>
          </div>

          {/* Departments */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Departments</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Cardiology</span>
              <span className="text-sm text-muted-foreground">Pediatrics</span>
              <span className="text-sm text-muted-foreground">Neurology</span>
              <span className="text-sm text-muted-foreground">Orthopedics</span>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@medicare.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>123 Healthcare Ave, Medical City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Medicare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
