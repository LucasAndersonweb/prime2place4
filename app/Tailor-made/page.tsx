import Header from "@/components/Header";
import styles from "./styles.module.scss";
import { HeroSection } from "@/components/HeroSection";
import ContactSection from "@/components/ContactSection";
import Scroll from "@/components/Scroll";
import Footer from "@/components/Footer";

export default function TailorMade() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <>
          <HeroSection />
          <ContactSection />
          <Scroll />
          <Footer />
        </>
      </div>
    </>
  );
}
