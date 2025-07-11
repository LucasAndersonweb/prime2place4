import Header from "@/components/Header";
import styles from "./styles.module.scss";
import Scroll from "@/components/Scroll";
import Footer from "@/components/Footer";
import { HeroSectionPremium } from "@/components/HeroSectionPremium";
import ContactSectionPremium from "@/components/ContactSectionPremium";

export default function AquisicaoPremium() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <>
          <HeroSectionPremium />
          <ContactSectionPremium />
          <Scroll />
          <Footer />
        </>
      </div>
    </>
  );
}
