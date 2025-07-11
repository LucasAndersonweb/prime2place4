import Header from "@/components/Header";
import styles from "./styles.module.scss";
import Scroll from "@/components/Scroll";
import Footer from "@/components/Footer";
import { HeroSectionVendas } from "@/components/HeroSectionVendas";
import ContactSectionVendas from "@/components/ContactSectionVendas";
import { HeroSectionGestao } from "@/components/HeroSectionGestao";
import { SolucaoGestao } from "@/components/SolucaoGestao";
import { ServicosAdministracao } from "@/components/ServicosAdministracao";
import { ApoioGestao } from "@/components/ApoioGestao";
import { EspecializacaoGestao } from "@/components/EspecializacaoGestao";
import { DicasInvestimentos } from "@/components/DicasInvestimentos";
import { SoliciteAvaliacao } from "@/components/SoliciteAvaliacao";
import { HeroSectionJuntar } from "@/components/HeroSectionJuntar";
import { SolucaoJuntar } from "@/components/SolucaoJuntar";
import { Diferenciais } from "@/components/Diferenciais";
import { ApresenteSe } from "@/components/ApresenteSe";

export default function Juntese() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <>
          <HeroSectionJuntar />
          <SolucaoJuntar />
          <Diferenciais />
          <EspecializacaoGestao />
          <ApresenteSe />
          <Footer />
        </>
      </div>
    </>
  );
}
