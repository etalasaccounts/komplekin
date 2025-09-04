import { Inter } from "next/font/google";
import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import WhyKomplekIn from "@/app/components/WhyKomplekIn";
import Demo from "@/app/components/Demo";
import TrialSection from "@/app/components/TrialSection";
import Features from "@/app/components/Features";
import Learn from "@/app/components/Learn";
import FAQ from "@/app/components/FAQ";
import Contact from "@/app/components/Contact";
import Footer from "@/app/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const Index = () => {
  return (
    <div className={`min-h-screen ${inter.variable} font-inter`}>
      <Header />
      <Hero />
      <Features />
      <WhyKomplekIn />
      <Demo />
      <TrialSection />
      <Learn />
      <FAQ />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
