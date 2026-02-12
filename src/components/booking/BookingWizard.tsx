import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Heart, Brain, Bone, Baby, Eye, Stethoscope, Loader2 } from "lucide-react";
import DepartmentStep from "./steps/DepartmentStep";
import DoctorStep from "./steps/DoctorStep";
import TimeSlotStep from "./steps/TimeSlotStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import { useBooking, type BookingDoctor, type TimeSlot } from "@/hooks/useBooking";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export type { BookingDoctor as Doctor, TimeSlot };

export interface BookingData {
  department: string | null;
  doctor: BookingDoctor | null;
  timeSlot: TimeSlot | null;
}

const departments = [
  { id: "cardiology", name: "Cardiology", icon: Heart, description: "Heart and cardiovascular care", color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  { id: "neurology", name: "Neurology", icon: Brain, description: "Brain and nervous system", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: "orthopedics", name: "Orthopedics", icon: Bone, description: "Bone and joint specialists", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { id: "pediatrics", name: "Pediatrics", icon: Baby, description: "Child health and development", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "ophthalmology", name: "Ophthalmology", icon: Eye, description: "Eye care and vision", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" },
  { id: "general medicine", name: "General Medicine", icon: Stethoscope, description: "Primary care services", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
];

interface BookingWizardProps {
  initialDepartment?: string;
}

const steps = [
  { id: 1, title: "Department", description: "Select your medical specialty" },
  { id: 2, title: "Doctor", description: "Choose your preferred doctor" },
  { id: 3, title: "Time Slot", description: "Pick an available time" },
  { id: 4, title: "Confirm", description: "Review your booking" },
];

const BookingWizard = ({ initialDepartment }: BookingWizardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(initialDepartment ? 2 : 1);
  const [bookingData, setBookingData] = useState<BookingData>({
    department: initialDepartment || null,
    doctor: null,
    timeSlot: null,
  });
  const [bookingComplete, setBookingComplete] = useState(false);

  const { doctors, timeSlots, loading, submitting, createAppointment, isAuthenticated } = useBooking(
    bookingData.department,
    bookingData.doctor?.id || null
  );

  // Redirect to auth if not logged in when trying to book
  useEffect(() => {
    if (currentStep === 4 && !isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to complete your booking.",
      });
      navigate("/auth", { state: { returnTo: "/booking" } });
    }
  }, [currentStep, isAuthenticated, navigate, toast]);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!bookingData.department;
      case 2: return !!bookingData.doctor;
      case 3: return !!bookingData.timeSlot;
      default: return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSelectDepartment = (deptId: string) => {
    setBookingData({ ...bookingData, department: deptId, doctor: null, timeSlot: null });
  };

  const handleSelectDoctor = (doctor: BookingDoctor) => {
    setBookingData({ ...bookingData, doctor, timeSlot: null });
  };

  const handleSelectTimeSlot = (slot: TimeSlot) => {
    setBookingData({ ...bookingData, timeSlot: slot });
  };

  const handleConfirmBooking = async () => {
    if (!bookingData.doctor || !bookingData.timeSlot || !bookingData.department) return;

    const success = await createAppointment(
      bookingData.doctor.id,
      bookingData.department,
      bookingData.timeSlot.dateTime
    );

    if (success) {
      setBookingComplete(true);
    }
  };

  if (bookingComplete) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-card rounded-xl card-shadow p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <Check className="h-10 w-10 text-success" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-6">
            Your appointment with {bookingData.doctor?.name} has been scheduled for{" "}
            {bookingData.timeSlot?.date} at {bookingData.timeSlot?.time}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/")}>Return Home</Button>
            <Button variant="outline" onClick={() => {
              setBookingComplete(false);
              setCurrentStep(1);
              setBookingData({ department: null, doctor: null, timeSlot: null });
            }}>
              Book Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-colors ${
                    currentStep > step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : currentStep === step.id
                      ? "border-primary text-primary bg-primary/10"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                <div className="hidden md:block text-center mt-2">
                  <div className={`text-sm font-medium ${currentStep >= step.id ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.title}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block w-16 lg:w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-xl card-shadow p-6 md:p-8 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <DepartmentStep
                departments={departments}
                selected={bookingData.department}
                onSelect={handleSelectDepartment}
              />
            )}
            {currentStep === 2 && (
              <DoctorStep
                doctors={doctors}
                selected={bookingData.doctor}
                onSelect={handleSelectDoctor}
                loading={loading}
              />
            )}
            {currentStep === 3 && (
              <TimeSlotStep
                slots={timeSlots}
                selected={bookingData.timeSlot}
                onSelect={handleSelectTimeSlot}
                loading={loading}
              />
            )}
            {currentStep === 4 && (
              <ConfirmationStep
                bookingData={bookingData}
                departments={departments}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
          className={currentStep === 1 ? "invisible" : ""}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {currentStep < 4 ? (
          <Button
            variant="default"
            onClick={handleNext}
            disabled={!canProceed() || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleConfirmBooking} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm Booking
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BookingWizard;
