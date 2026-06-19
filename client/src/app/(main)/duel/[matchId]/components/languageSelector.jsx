"use client";

import { useState, useRef, useEffect } from "react";
import "./languageSelector.css";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript", icon: "JS" },
  { value: "python", label: "Python", icon: "PY" },
  { value: "java", label: "Java", icon: "JV" },
  { value: "cpp", label: "C++", icon: "C+" },
];

export default function LanguageSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = LANGUAGES.find((l) => l.value === value) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="ls-root" ref={ref}>
      <button
        className={`ls-trigger${open ? " ls-trigger--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ls-icon">{selected.icon}</span>
        <span className="ls-label">{selected.label}</span>
        <svg
          className={`ls-chevron${open ? " ls-chevron--up" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul className="ls-dropdown" role="listbox">
          {LANGUAGES.map((lang) => (
            <li
              key={lang.value}
              className={`ls-option${lang.value === value ? " ls-option--active" : ""}`}
              role="option"
              aria-selected={lang.value === value}
              onClick={() => {
                onChange(lang.value);
                setOpen(false);
              }}
            >
              <span className="ls-icon ls-icon--sm">{lang.icon}</span>
              <span>{lang.label}</span>
              {lang.value === value && (
                <svg
                  className="ls-check"
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6.5l3.5 3.5L11 3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
