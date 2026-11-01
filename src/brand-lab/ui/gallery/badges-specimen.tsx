"use client";

import { Video } from "lucide-react";
import { useGallery } from "./gallery-context";
import styles from "./gallery.module.css";

export function BadgesSpecimen() {
  const { copy } = useGallery();
  const { success, info, warning, tags } = copy.badges;

  return (
    <div className={styles.panel}>
      <span className={styles.eyebrow}>Semantic States</span>
      <div className={styles.badges}>
        <span className={styles.badge} data-tone="success">
          <i aria-hidden />
          {success}
        </span>
        <span className={styles.badge} data-tone="info">
          <Video aria-hidden size={13} />
          {info}
        </span>
        <span className={styles.badge} data-tone="warning">
          <i aria-hidden />
          {warning}
        </span>
      </div>
      <div className={styles.badges}>
        {tags.map((tag) => (
          <span key={tag} className={styles.microTag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
