"use client";
import { useState, Suspense, useEffect } from "react";
import CustomSwiper from "@/components/CustomSwiper";
import Header from "@/components/Header";
import Player from "@/components/Player";
import Modal from "@/components/Modal";
import styles from "./page.module.scss";
import { Prime2PlaceCollections } from "@/components/Prime2PlaceCollections";
import WaitAndLive from "@/components/WaitAndLive";
import OurFocus from "@/components/OurFocus";
import ScrollText2 from "@/components/Scroll2";
import Footer from "@/components/Footer";
import ScrollText from "@/components/Scroll";
import PrimeUniverse from "@/components/PrimeUniverse";
import Depoimentos from "@/components/Depoimentos";
import BuyOrSell from "@/components/BuyOrSell";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    // Verifica se é a primeira visita do usuário
    const hasVisited = localStorage.getItem("hasVisitedBefore");

    if (!hasVisited) {
      // Se nunca visitou antes, mostra o modal
      setShowModal(true);
      // Marca que o usuário já visitou
      localStorage.setItem("hasVisitedBefore", "true");
    }
  }, []);

  const closeModal = () => {
    setShowModal(false);
  };

  const [isSale, setIsSale] = useState(true);
  const handleSelectionChange = (isSale: boolean) => {
    setIsSale(isSale);
  };

  return (
    <>
      {showModal && <Modal onClose={closeModal} />}
      <div className={styles.container}>
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
          <Player />
        </Suspense>
        <CustomSwiper />
        <WaitAndLive />
        <Prime2PlaceCollections />
        <OurFocus />
        <ScrollText2 isSale={isSale} />
        <BuyOrSell onSelectionChange={handleSelectionChange} />
        <PrimeUniverse />
        <Depoimentos />
        <ScrollText />
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
}
