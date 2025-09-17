"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

export default function WhyKomplekIn() {
  // Fixed X reference error by removing icon imports
  const problems = [
    "Resident data scattered in manual records.",
    "Late IPL & dues payments.",
    "Important announcements don't reach everyone.",
    "Financial reports are slow and error-prone."
  ];

  const solutions = [
    "Resident data stored neatly and easy to access.",
    "Payments simplified with integrated payment gateway.",
    "Automatic & transparent financial reports.",
    "Faster, centralized communication with residents."
  ];

  const addedValues = [
    {
      icon: "🔍",
      title: "Transparency",
      description: "that increases residents' trust."
    },
    {
      icon: "⚡",
      title: "Efficiency",
      description: "for admins without manual work."
    },
    {
      icon: "🎯",
      title: "Convenience",
      description: "for residents with everything easier."
    }
  ];

  return (
    <section id="why-komplek-in" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Content Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Left Side - Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                Because Managing a Complex Shouldn&apos;t Be Complicated.
              </h2>
              
              {/* Tabbed Problems & Solutions */}
              <Tabs defaultValue="problems" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="problems" className="cursor-pointer">Common Problems</TabsTrigger>
                  <TabsTrigger value="solutions" className="cursor-pointer">Solution with Komplek In</TabsTrigger>
                </TabsList>
                
                <TabsContent value="problems" className="mt-6">
                  <div className="space-y-3">
                    {problems.map((problem, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2.5 flex-shrink-0"></div>
                        <p className="text-sm text-muted-foreground">
                          {problem}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="solutions" className="mt-6">
                  <div className="space-y-3">
                    {solutions.map((solution, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full mt-2.5 flex-shrink-0" style={{ backgroundColor: '#EE7C2B' }}></div>
                        <p className="text-sm text-muted-foreground">
                          {solution}
                        </p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Side - Dashboard Image */}
            <div className="relative">
              <Image 
                src="/images/landing-page/admin-dashboard.png" 
                alt="Komplek In Dashboard Interface" 
                className="w-full h-auto rounded-lg shadow-lg"
                width={1000}
                height={500}
              />
            </div>
          </div>

          {/* Key Added Values */}
          <div className="mb-12">
            <div className="grid md:grid-cols-3 gap-8">
              {addedValues.map((value, index) => (
                <Card key={index} className="text-center p-6 border-none shadow-sm bg-card/50">
                  <CardContent className="p-0">
                    <div className="text-3xl mb-3">{value.icon}</div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {value.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Closing Statement */}
          <div className="text-center">
            <p className="text-xl font-medium text-foreground mb-8 max-w-3xl mx-auto">
              &quot;Komplek In isn&apos;t just an app—it&apos;s the solution to make your complex organized, modern, and harmonious.&quot;
            </p>
            
            <Button variant="outline" size="lg" className="font-semibold cursor-pointer" onClick={() => window.location.href = "https://komplek.in/admin/auth"}>
              Ready to try Komplek In? Move on to the free demo.
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
