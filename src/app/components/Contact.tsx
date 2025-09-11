"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    complexName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/send-email/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Pesan berhasil dikirim!", {
          description: "Tim support kami akan menghubungi Anda dalam 24 jam.",
        });
        setFormData({ name: "", email: "", phone: "", complexName: "" });
      } else {
        const errorData = await response.json();
        toast.error("Gagal mengirim pesan", {
          description: errorData.error || "Terjadi kesalahan, silakan coba lagi.",
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error("Gagal mengirim pesan", {
        description: "Terjadi kesalahan jaringan, silakan coba lagi.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };



  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">
          Have more questions? We&apos;re ready to help.
        </h2>
        
        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="block text-left">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="block text-left">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="block text-left">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+62 812 3456 7890"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complexName" className="block text-left">Complex Name</Label>
                <Input
                  id="complexName"
                  name="complexName"
                  value={formData.complexName}
                  onChange={handleInputChange}
                  placeholder="Your complex/building name"
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1 cursor-pointer" size="lg" style={{ backgroundColor: '#EE7C2B', borderColor: '#EE7C2B' }}>
                  <Send className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Contact;