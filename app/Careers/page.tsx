"use client";

import WorkUs from "@/components/WorkUS";
import styles from "./styles.module.scss";

export default function Careers() {
  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <WorkUs />
        </div>
      </div>
    </>
  );
}
