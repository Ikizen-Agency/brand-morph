"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useId, useRef } from "react";
import { searchDirectory, validateFullName } from "../../application/gallery";
import { useGallery } from "./gallery-context";
import styles from "./gallery.module.css";

export function FormSpecimen() {
  const { specimens, dispatch, copy } = useGallery();
  const { search, fullName, specialty, reminders, consent } = specimens;
  const id = useId();
  const searchRef = useRef<HTMLInputElement>(null);

  const hasQuery = search.trim() !== "";
  const results = searchDirectory(copy.directory, search);
  const nameProblem = validateFullName(fullName);
  const nameMessage = {
    required: `${copy.name.label} is required.`,
    short: "Use at least 2 characters.",
  };

  return (
    <div className={styles.panel}>
      <div className={styles.field} role="search">
        <label htmlFor={`${id}-search`} className={styles.eyebrow}>
          Search Bar Component
        </label>
        <div className={styles.searchBox}>
          <Search aria-hidden size={20} className={styles.searchIcon} />
          <input
            ref={searchRef}
            id={`${id}-search`}
            type="search"
            value={search}
            placeholder={copy.search.placeholder}
            className={styles.searchInput}
            onChange={(event) => dispatch({ type: "setSearch", value: event.target.value })}
          />
          {search ? (
            <button
              type="button"
              aria-label="Clear search"
              className={styles.searchClear}
              onClick={() => {
                dispatch({ type: "setSearch", value: "" });
                searchRef.current?.focus();
              }}
            >
              <X aria-hidden size={16} />
            </button>
          ) : null}
        </div>
        <p role="status" data-testid="search-status" className={styles.helper}>
          {hasQuery
            ? `${results.length} ${copy.search.noun}${results.length === 1 ? "" : "s"} found`
            : ""}
        </p>
        {results.length > 0 ? (
          <ul aria-label="Search results" className={styles.results}>
            {results.map(({ name, detail }) => (
              <li key={name}>
                <strong>{name}</strong>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={styles.field}>
        <div className={styles.floatingField} data-invalid={nameProblem !== null}>
          <label htmlFor={`${id}-name`} className={styles.floatingLabel}>
            {copy.name.label}
          </label>
          <input
            id={`${id}-name`}
            type="text"
            required
            autoComplete="off"
            value={fullName}
            aria-invalid={nameProblem !== null}
            aria-describedby={`${id}-name-help`}
            className={styles.floatingInput}
            onChange={(event) => dispatch({ type: "setName", value: event.target.value })}
          />
        </div>
        <p
          id={`${id}-name-help`}
          data-testid="name-help"
          className={nameProblem ? styles.error : styles.helper}
        >
          {nameProblem ? nameMessage[nameProblem] : copy.name.helper}
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-specialty`} className={styles.eyebrow}>
          {copy.specialty.label}
        </label>
        <div className={styles.selectBox}>
          <select
            id={`${id}-specialty`}
            value={specialty}
            className={styles.select}
            onChange={(event) => dispatch({ type: "setSpecialty", value: event.target.value })}
          >
            {copy.specialty.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <ChevronDown aria-hidden size={18} className={styles.selectIcon} />
        </div>
      </div>

      <div className={styles.group}>
        <div className={styles.switchRow}>
          <div className={styles.switchText}>
            <span id={`${id}-reminders`} className={styles.switchTitle}>
              {copy.reminders.title}
            </span>
            <span id={`${id}-reminders-detail`} className={styles.switchDetail}>
              {copy.reminders.detail}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reminders}
            aria-labelledby={`${id}-reminders`}
            aria-describedby={`${id}-reminders-detail`}
            className={styles.switch}
            onClick={() => dispatch({ type: "toggle", flag: "reminders" })}
          >
            <span className={styles.thumb} />
          </button>
        </div>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={consent}
            aria-describedby={consent ? undefined : `${id}-consent-error`}
            aria-invalid={!consent}
            onChange={() => dispatch({ type: "toggle", flag: "consent" })}
          />
          <span>{copy.consent.label}</span>
        </label>
        {consent ? null : (
          <p id={`${id}-consent-error`} data-testid="consent-error" className={styles.error}>
            {copy.consent.required}
          </p>
        )}
      </div>
    </div>
  );
}
