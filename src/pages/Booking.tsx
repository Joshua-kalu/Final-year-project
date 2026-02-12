import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BookingWizard from "@/components/booking/BookingWizard";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const initialDepartment = searchParams.get("department") || undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-8 md:py-12">
        <div className="container">
          <BookingWizard initialDepartment={initialDepartment} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
