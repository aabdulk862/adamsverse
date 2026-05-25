import SEOHead from "../components/SEOHead";
import HeroSection from "../components/HeroSection";
import SocialProofBar from "../components/SocialProofBar";
import ProductGrid from "../components/ProductGrid";
import PackagesShowcase from "../components/PackagesShowcase";
import ServicesSection from "../components/ServicesSection";
import CTASection from "../components/CTASection";
import { products } from "../data/productRegistry";

const liveProducts = products.filter((p) => p.status === "live");

export default function HomePage() {
  return (
    <main className="product-hub">
      <SEOHead products={liveProducts} />
      <HeroSection />
      <SocialProofBar />
      <ProductGrid />
      <PackagesShowcase />
      <ServicesSection />
      <CTASection />
    </main>
  );
}
