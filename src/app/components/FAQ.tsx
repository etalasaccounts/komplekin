import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "Is Komplek In difficult to use?",
      answer: "No. Komplek In is designed to be simple for both admins and residents without any technical skill required."
    },
    {
      question: "How secure is residents' data in Komplek In?",
      answer: "Data is securely stored with encryption. Only authorized admins can access specific data."
    },
    {
      question: "Can Komplek In be accessed via mobile?",
      answer: "Yes. Komplek In works on desktop and mobile web, accessible anytime, anywhere."
    },
    {
      question: "Is there a cost to try Komplek In?",
      answer: "No. Free demo is available with no cost. Long-term usage fees will depend on the complex's needs."
    },
    {
      question: "Can Komplek In adapt to each complex's needs?",
      answer: "Yes. Komplek In's features are flexible and customizable to your requirements."
    },
    {
      question: "What if residents or admins encounter difficulties?",
      answer: "The Komplek In team is ready to assist with guides and direct support via chat or WhatsApp."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Left side - Title and Description */}
          <div className="lg:sticky lg:top-24">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              We compiled a list of answers to address your most pressing questions regarding our services.
            </p>
          </div>

          {/* Right side - FAQ Accordion */}
          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white rounded-lg shadow-sm border-0 px-6"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:text-[#EE7C2B] transition-colors py-6 cursor-pointer">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}