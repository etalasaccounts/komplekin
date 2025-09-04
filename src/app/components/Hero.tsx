import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen bg-gradient-to-br from-slate-50 to-white overflow-hidden pt-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-100 bg-[size:50px_50px] opacity-30" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headlines */}
          <h1 className="text-[42px] font-bold text-foreground mb-6 leading-tight">
            Manage Your Complex Residents & Finances 10x More Efficiently with a Single App.
          </h1>
          
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Komplek In helps RT/RW, managers, and residents organize administration, payments, and communication faster, transparently, and modernly.
          </p>
          
          {/* CTA Button */}
          <div className="mb-16">
            <Button 
              variant="default" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold hover:bg-[#D66A25] hover:border-[#D66A25] cursor-pointer"
              style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}
            >
              Try Free Demo
            </Button>
          </div>

          {/* Dashboard Image */}
          <div className="relative max-w-7xl mx-auto">
            <div className="relative bg-white rounded-2xl shadow-2xl p-2">
              <img 
                src="/images/landing-page/admin-dashboard.png" 
                alt="Komplek In Dashboard - Complex Management Interface"
                className="w-full h-auto rounded-xl object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}