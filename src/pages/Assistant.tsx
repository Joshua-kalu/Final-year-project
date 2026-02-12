import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChat from "@/components/assistant/AIChat";

const Assistant = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-background py-8 md:py-12">
        <div className="container">
          <AIChat />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Assistant;
