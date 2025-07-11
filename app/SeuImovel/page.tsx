import Header from "@/components/Header";
import styles from "./styles.module.scss";
import Scroll from "@/components/Scroll";
import Footer from "@/components/Footer";
import { Section1 } from "@/components/Section1";
import Section2 from "@/components/Section2";

export default function SeuImovel() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <>
          <Section1 />
          <Section2 />
          <Scroll />
          <Footer />
        </>
      </div>
    </>
  );
}
