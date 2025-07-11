"use client";

import styles from "./styles.module.scss";
import ContactForm from "@/components/ContactForm";

export default function Contact() {
  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <ContactForm />
        </div>
      </div>
    </>
  );
}
