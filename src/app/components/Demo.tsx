import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";

export default function Demo() {
  const benefits = [
    {
      icon: "🎁",
      title: "Free Access",
      description: "no cost, no commitment."
    },
    {
      icon: "👨‍💻",
      title: "Guidance from the Komplek In Team",
      description: "we help set up & answer all questions."
    },
    {
      icon: "🚀",
      title: "Experience New Features First",
      description: "practice directly, not just theory."
    },
    {
      icon: "🌟",
      title: "Help Shape the App",
      description: "your feedback contributes to building Komplek In."
    }
  ];

  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-[#EE7C2B]/5 to-[#EE7C2B]/10">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Be the First to Experience Easy Complex Management.
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Try a free demo of Komplek In and see for yourself how managing residents, 
                finances, and communication can be much easier.
              </p>

              {/* Demo Benefits */}
              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="text-xl mr-4 mt-1 flex-shrink-0">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground mb-1">
                        {benefit.title}
                      </h4>
                      <p className="text-base text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Persuasive Closing */}
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-primary/10">
                <p className="text-lg font-medium text-foreground text-center">
                  &quot;Take a small step for a big change in your complex. Try it now and feel the difference.&quot;
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="flex-1 font-semibold hover:bg-[#D66A25] hover:border-[#D66A25] cursor-pointer"
                  style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Sign Up for Free Demo Now
                </Button>
                <Button variant="outline" size="lg" className="flex-1 font-semibold cursor-pointer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat via WhatsApp to Start
                </Button>
              </div>
            </div>

            {/* Right Side - Mobile Mockup */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-[#EE7C2B]/20 to-[#EE7C2B]/30 rounded-2xl p-8">
                <img 
                  src="/images/landing-page/user-dashboard.png" 
                  alt="Komplek In Mobile App Demo" 
                  className="w-auto max-w-sm mx-auto h-[680px] rounded-xl shadow-2xl"
                />
                
                {/* Floating Elements */}
                <div className="absolute top-4 right-4 bg-[#EE7C2B]/90 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Live Demo
                </div>
                
                <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm border border-primary/20 px-4 py-2 rounded-lg">
                  <p className="text-xs text-muted-foreground">Real-time Updates</p>
                  <p className="text-sm font-semibold text-foreground">✅ Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}