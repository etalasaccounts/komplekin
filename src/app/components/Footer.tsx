"use client";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Instagram, Twitter, Facebook } from "lucide-react";

export default function Footer() {
  const navigationLinks = [
    { name: "Features", href: "#features" },
    { name: "Why Komplek.In", href: "#why-komplek-in" },
    { name: "Demo", href: "#demo" },
    { name: "Learn", href: "#learn" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" }
  ];

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Logo and Address */}
          <div className="flex-shrink-0 md:flex-[0.35]">
            <img src="/images/landing-page/logo-and-name-white.svg" alt="Komplek-In Logo" className="text-primary-foreground" />
            <div className="text-white/70 text-sm mb-4">
              <p>Jl. Sudirman No. 123 Jakarta Pusat 10270 Indonesia</p>
            </div>
            <div className="flex gap-3">
              <a href="#" className="text-white/70 hover:text-orange-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-orange-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-orange-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-shrink-0">
            <div className="flex flex-col gap-3">
              {navigationLinks.map((link, index) => (
                <a 
                  key={index}
                  href={link.href} 
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-white/70 hover:text-orange-500 transition-colors text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </nav>

          {/* Newsletter - Far Right */}
          <div className="flex-shrink-0 md:flex-[0.35]">
            <h4 className="text-white font-semibold mb-3">Join Newsletter</h4>
            <div className="flex gap-2 mb-4">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-secondary"
              />
              <Button 
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Subscribe
              </Button>
            </div>
            
            {/* Contact Support */}
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:support@komplekin.com"
                className="flex items-center gap-2 text-white/70 hover:text-orange-500 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>support@komplekin.com</span>
              </a>
              <a 
                href="https://wa.me/6221234567891"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/70 hover:text-orange-500 transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>+62 21 234 567 891</span>
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/20" />

        {/* Copyright */}
        <div className="text-center">
          <div className="text-white/70 text-sm">
            © 2024 Komplek In. Semua hak dilindungi undang-undang.
          </div>
        </div>
      </div>
    </footer>
  );
}