import Header from "@/components/Header";
import styles from "./styles.module.scss";
import Footer from "@/components/Footer";
import AvaliacaoForm from "@/components/AvaliacaoForm";
import { AvaliacaoFormPremium } from "@/components/AvaliacaoFormPremium";

export default function Avaliacao() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <AvaliacaoFormPremium />
        <Footer />
      </div>
    </>
  );
}
