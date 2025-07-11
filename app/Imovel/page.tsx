import Header from "@/components/Header";
import styles from "./styles.module.scss";
import Scroll from "@/components/Scroll";
import Footer from "@/components/Footer";

export default function SeuImovel() {
  return (
    <>
      <div className={styles.container}>
        <Header />

        <Footer />
      </div>
    </>
  );
}
