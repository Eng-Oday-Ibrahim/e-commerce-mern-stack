import TrustSection from "@/app/components/sections/Trust-Proposition-Section"
import CTASection from "@/app/components/sections/Cta-section"
import CategoriesSection from "@/app/components/sections/Categories-section";
import CollectionsSection from "@/app/components/sections/Collections-section";
import FeaturedProductsSection from "@/app/components/sections/Featured-Products-section";
import CatalogSection from "@/app/components/sections/Look-Books-section";
import HeroSection from "./components/sections/Hero-section";
import FaqSection from "@/components/sections/Faq-section";

export default function Home() {
  return (
    <div className="">
       <HeroSection/>
       <TrustSection/>
      <FeaturedProductsSection />
      <CategoriesSection />
      <CollectionsSection />
      <CatalogSection />
      <FaqSection/>
      <CTASection/>
    </div>
  );
}