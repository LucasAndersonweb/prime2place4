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

export default function Gestao() {
  return (
    <>
      <div className={styles.container}>
        <Header />
        <>
          <HeroSectionGestao />
          <SolucaoGestao />
          <ServicosAdministracao />
          <ApoioGestao />
          <EspecializacaoGestao />
          <DicasInvestimentos />
          <SoliciteAvaliacao />
          <Footer />
        </>
      </div>
    </>
  );
}
