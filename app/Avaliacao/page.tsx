import Header from "@/components/Header";
import styles from "./styles.module.scss";
import Footer from "@/components/Footer";
import AvaliacaoForm from "@/components/AvaliacaoForm";

export default function Avaliacao() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <AvaliacaoForm />
        <Footer />
      </div>
    </>
  );
}
