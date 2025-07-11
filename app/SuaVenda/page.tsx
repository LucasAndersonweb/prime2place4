import Header from "@/components/Header";
import styles from "./styles.module.scss";
import Scroll from "@/components/Scroll";
import Footer from "@/components/Footer";
import { HeroSectionVendas } from "@/components/HeroSectionVendas";
import ContactSectionVendas from "@/components/ContactSectionVendas";

export default function SuaVenda() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <>
          <HeroSectionVendas />
          <ContactSectionVendas />
          <Scroll />
          <Footer />
        </>
      </div>
    </>
  );
}
