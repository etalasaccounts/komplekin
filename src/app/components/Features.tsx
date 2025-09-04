import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Features() {
  const features = [
    {
      title: "Resident Management",
      description: "Keep resident data organized and easy to access. No more scattered data on paper or Excel.",
      emoji: "👥"
    },
    {
      title: "Financial Management", 
      description: "Record income and expenses with full transparency. Financial reports can be checked anytime, accurately.",
      emoji: "💰"
    },
    {
      title: "IPL & Donation Payments",
      description: "Residents can pay dues and donations directly via the app. Payments are more punctual, admins worry less thanks to automatic records.",
      emoji: "💳"
    },
    {
      title: "Dashboard Overview",
      description: "View all activity & finance summaries in one screen. Admins can make decisions faster & more accurately.",
      emoji: "📊"
    },
    {
      title: "Payment Gateway",
      description: "Supports various digital payment methods. Residents can choose the most convenient payment method.",
      emoji: "🔗"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            All Your Complex Management Needs, Solved in One App.
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            No more manual records, late payments, or scattered information. Komplek In makes management easier for both admins and residents with a fast, secure, and transparent digital system.
          </p>
        </div>

        <div className="max-w-6xl mx-auto mb-16">
          {/* First row - 3 features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {features.slice(0, 3).map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border border-border/50 bg-card hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">
                      {feature.emoji}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Second row - 2 features taking full width */}
          <div className="grid md:grid-cols-2 gap-8">
            {features.slice(3, 5).map((feature, index) => (
              <Card key={index + 3} className="group hover:shadow-lg transition-all duration-300 border border-border/50 bg-card hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="text-2xl mr-3">
                      {feature.emoji}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-xl font-medium text-foreground mb-8 max-w-2xl mx-auto">
            "With Komplek In, residents feel comfortable, admins become more efficient, and the complex becomes more modern."
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="default" 
              size="lg" 
              className="font-semibold hover:bg-[#D66A25] hover:border-[#D66A25] cursor-pointer"
              style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}
            >
              Try Free Demo
            </Button>
            <Button variant="outline" size="lg" className="font-semibold cursor-pointer">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
