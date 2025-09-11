"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "Why Komplek.In", id: "why-komplek-in" },
    { label: "Demo", id: "demo" },
    { label: "Learn", id: "learn" },
    { label: "FAQ", id: "faq" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <header className="w-full bg-white border-b border-border/10 relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => scrollToSection("hero")}
          >
            <img src="/images/landing-page/logo-and-name-black.svg" alt="Komplek-In Logo" className="text-primary-foreground" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-foreground transition-colors hover:text-[#EE7C2B] cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => scrollToSection("contact")}>
              Contact Now
            </Button>
            <Button 
              variant="default" 
              size="sm"
              style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}
              className="hover:bg-[#D66A25] hover:border-[#D66A25] cursor-pointer"
              onClick={() => window.location.href = "https://komplek.in/admin/auth"}
            >
              Try it Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-border/10 shadow-lg z-40">
            <nav className="py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="px-4 py-2 space-y-2">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => scrollToSection("contact")}
                >
                  Contact Now
                </Button>
                <Button 
                  className="w-full"
                  style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}
                  onClick={() => window.location.href = "https://komplek.in/admin/auth"}
                >
                  Try it Free
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}