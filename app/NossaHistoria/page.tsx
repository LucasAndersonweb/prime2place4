import Header from "@/components/Header";
import styles from "./styles.module.scss";
import ContactSection from "@/components/ContactSection";
import Scroll from "@/components/Scroll";
import Footer from "@/components/Footer";
import HistoriaPrime from "@/components/HistoriaPrime";

export default function TailorMade() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <>
          <HistoriaPrime />

          <Scroll />
          <Footer />
        </>
      </div>
    </>
  );
}
