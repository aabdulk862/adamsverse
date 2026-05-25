import SEOHead from "../components/SEOHead";
import HeroSection from "../components/HeroSection";
import ToolsHub from "../components/ToolsHub";
import PackagesShowcase from "../components/PackagesShowcase";
import ServicesSection from "../components/ServicesSection";
import CTASection from "../components/CTASection";
import { products } from "../data/productRegistry";
import styles from "./HomePage.module.css";

const liveProducts = products.filter((p) => p.status === "live");

export default function HomePage() {
  return (
    <main className={styles.productHub}>
      <SEOHead products={liveProducts} />
      <HeroSection />
      <ToolsHub />
      <PackagesShowcase />
      <ServicesSection />
      <CTASection />
    </main>
  );
}
