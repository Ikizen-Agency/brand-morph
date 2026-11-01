"use client";

import { CircleCheck, FileSearch, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { useRef, type ChangeEvent } from "react";
import { formatBytes, onboardingProgress } from "../../application/gallery";
import { useGallery } from "./gallery-context";
import styles from "./gallery.module.css";

export function FeedbackSpecimen() {
  const { specimens, dispatch, copy, announce } = useGallery();
  const { alertVisible, upload } = specimens;
  const progress = onboardingProgress(specimens);

  const dismissRef = useRef<HTMLButtonElement>(null);
  const replayRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLButtonElement>(null);

  const setAlert = (visible: boolean) => {
    dispatch({ type: "setAlert", visible });
    // The pressed control unmounts, so focus follows to its counterpart on the next frame.
    requestAnimationFrame(() => (visible ? dismissRef : replayRef).current?.focus());
  };

  const attach = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    dispatch({ type: "setUpload", file: { name: file.name, size: file.size } });
    announce(`${file.name} attached locally. Nothing was uploaded.`);
  };

  const removeFile = () => {
    dispatch({ type: "setUpload", file: null });
    announce("File removed.");
    uploadRef.current?.focus();
  };

  return (
    <div className={styles.panel}>
      <div data-testid="alert-region" role="status" className={styles.alertRegion}>
        {alertVisible ? (
          <div className={styles.alert}>
            <CircleCheck aria-hidden size={20} />
            <div className={styles.alertText}>
              <strong>{copy.alert.title}</strong>
              <span>{copy.alert.detail}</span>
            </div>
            <button
              ref={dismissRef}
              type="button"
              aria-label="Dismiss alert"
              className={styles.alertClose}
              onClick={() => setAlert(false)}
            >
              <X aria-hidden size={16} />
            </button>
          </div>
        ) : null}
      </div>
      {alertVisible ? null : (
        <button
          ref={replayRef}
          type="button"
          className={styles.quiet}
          onClick={() => setAlert(true)}
        >
          <RotateCcw aria-hidden size={14} />
          Replay alert
        </button>
      )}

      <div className={styles.group}>
        <div className={styles.progressHead}>
          <span id="gallery-progress" className={styles.eyebrow}>
            {copy.progressLabel}
          </span>
          <span data-testid="progress-value" className={styles.progressValue}>
            {progress}% Complete
          </span>
        </div>
        <div
          role="progressbar"
          aria-labelledby="gallery-progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className={styles.progressTrack}
        >
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={styles.empty}>
        <span aria-hidden className={styles.emptyIcon}>
          <FileSearch size={24} />
        </span>
        {upload ? (
          <div data-testid="upload-summary" className={styles.emptyText}>
            <h3>{upload.name}</h3>
            <p>{formatBytes(upload.size)} attached in this tab only. Nothing was uploaded.</p>
          </div>
        ) : (
          <div className={styles.emptyText}>
            <h3>{copy.empty.title}</h3>
            <p>{copy.empty.detail}</p>
          </div>
        )}
        <input ref={pickerRef} type="file" hidden data-testid="upload-input" onChange={attach} />
        <div className={styles.emptyActions}>
          <button
            ref={uploadRef}
            type="button"
            className={styles.quiet}
            onClick={() => pickerRef.current?.click()}
          >
            <Upload aria-hidden size={16} />
            {copy.empty.upload}
          </button>
          {upload ? (
            <button type="button" className={styles.quiet} onClick={removeFile}>
              <Trash2 aria-hidden size={16} />
              Remove file
            </button>
          ) : null}
        </div>
      </div>

      <div aria-hidden data-testid="skeleton" className={styles.skeleton}>
        <i />
        <div>
          <i />
          <i />
        </div>
        <i />
      </div>
    </div>
  );
}
