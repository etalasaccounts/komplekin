import { Button } from "@/components/ui/button";

const TrialSection = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#EE7C2B]/5 to-[#EE7C2B]/10">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-[#EE7C2B] rounded-xl flex items-center justify-center">
            <img src="/images/landing-page/logo-outline-white.svg" alt="Komplek-In Logo" className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-semibold text-foreground mb-12 leading-tight">
          No need to wait. Start now and make complex management easier and transparent.
        </h2>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button 
            variant="default" 
            size="lg" 
            className="px-8 py-4 text-lg font-semibold hover:bg-[#D66A25] hover:border-[#D66A25] cursor-pointer"
            style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}
          >
            Try Now
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TrialSection;