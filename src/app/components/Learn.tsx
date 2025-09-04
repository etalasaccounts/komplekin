import { Button } from "@/components/ui/button";

const Learn = () => {
  const articles = [
    {
      title: "Manual vs Digital – Which is More Effective?",
      content: "Manual management is time-consuming and error-prone: scattered data, late payments, slow reports. With a digital system, everything is automatic, transparent, and accessible anytime.",
      backgroundImage: "/images/landing-page/manual-vs-digital.jpg"
    },
    {
      title: "Transparency = Resident Trust",
      content: "Problems often arise from lack of transparency in finance and communication. Komplek In organizes all financial records neatly, makes announcements clear, and grants access appropriately.",
      backgroundImage: "/images/landing-page/transparency-trust.jpg"
    },
    {
      title: "Bringing Your Complex into the Modern Era",
      content: "Schools, businesses, and public services have gone digital; complexes should adapt too. With an integrated app, complex management becomes more modern, professional, and valuable for all residents.",
      backgroundImage: "/images/landing-page/modern-era.jpg"
    }
  ];

  return (
    <section id="learn" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Digitalizing Your Complex Matters
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how going digital can save time, increase trust, and modernize your community management.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {articles.map((article, index) => (
            <div 
              key={index} 
              className="group cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              {/* Image */}
              <div className="overflow-hidden rounded-2xl mb-6">
                <img 
                  src={article.backgroundImage} 
                  alt={article.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              {/* Content */}
              <div>
                <div className="text-primary text-sm font-medium mb-2">
                  Short Article {index + 1}
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4 leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {article.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Closing Statement */}
        <div className="text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8">
          <p className="text-xl md:text-2xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            &quot;Digitalization is no longer optional—it&apos;s a necessity. Start with your complex, with Komplek In.&quot;
          </p>
          
          <Button 
            variant="default" 
            size="lg" 
            className="font-semibold hover:bg-[#D66A25] hover:border-[#D66A25]"
            style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}
          >
            Start Your Digital Journey
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Learn;