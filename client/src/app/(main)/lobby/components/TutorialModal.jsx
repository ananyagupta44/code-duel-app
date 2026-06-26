"use client";

import { useEffect, useRef } from "react";
import "./tutorialModal.css";

const CARD_WIDTH = 300;
const CARD_HEIGHT = 270;
const GAP = 18;
const SCREEN_PAD = 16;

function getBestPosition(rect) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try right
  if (rect.right + GAP + CARD_WIDTH + SCREEN_PAD <= vw) {
    return {
      top: clampV(rect.top, vh),
      left: rect.right + GAP,
      arrow: "left",
    };
  }

  // Try left
  if (rect.left - GAP - CARD_WIDTH - SCREEN_PAD >= 0) {
    return {
      top: clampV(rect.top, vh),
      left: rect.left - CARD_WIDTH - GAP,
      arrow: "right",
    };
  }

  // Try above
  if (rect.top - GAP - CARD_HEIGHT - SCREEN_PAD >= 0) {
    return {
      top: rect.top - CARD_HEIGHT - GAP,
      left: clampH(rect.left + rect.width / 2 - CARD_WIDTH / 2, vw),
      arrow: "bottom",
    };
  }

  // Try below
  if (rect.bottom + GAP + CARD_HEIGHT + SCREEN_PAD <= vh) {
    return {
      top: rect.bottom + GAP,
      left: clampH(rect.left + rect.width / 2 - CARD_WIDTH / 2, vw),
      arrow: "top",
    };
  }

  // Absolute fallback: center of screen, no arrow
  return {
    top: (vh - CARD_HEIGHT) / 2,
    left: (vw - CARD_WIDTH) / 2,
    arrow: "none",
  };
}

function clampV(v, vh) {
  return Math.min(Math.max(v, SCREEN_PAD), vh - CARD_HEIGHT - SCREEN_PAD);
}

function clampH(v, vw) {
  return Math.min(Math.max(v, SCREEN_PAD), vw - CARD_WIDTH - SCREEN_PAD);
}

export default function TutorialModal({
  title,
  description,
  step,
  totalSteps,
  onSkip,
  onNext,
  targetRef,
}) {
  const cardRef = useRef(null);
  const veilRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (step === 1) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [step]);

  useEffect(() => {
    if (!targetRef?.current) return;

    targetRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [targetRef]);

  useEffect(() => {
    function update() {
      const card = cardRef.current;
      const veil = veilRef.current;
      if (!card || !veil) return;

      if (!targetRef?.current) {
        // No target — center card, full veil no cutout
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        card.style.top = `${(vh - CARD_HEIGHT) / 2}px`;
        card.style.left = `${(vw - CARD_WIDTH) / 2}px`;
        card.className = "tutorial-card arrow-none";
        veil.style.clipPath = "";
        rafRef.current = requestAnimationFrame(update);
        return;
      }

      targetRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const rect = targetRef.current.getBoundingClientRect();
      const { top, left, arrow } = getBestPosition(rect);

      card.style.top = `${top}px`;
      card.style.left = `${left}px`;
      card.className = `tutorial-card arrow-${arrow}`;

      // Veil cutout over target
      const pad = 10;
      const x1 = rect.left - pad;
      const y1 = rect.top - pad;
      const x2 = rect.right + pad;
      const y2 = rect.bottom + pad;

      veil.style.clipPath = `polygon(
        0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
        ${x1}px ${y1}px,
        ${x1}px ${y2}px,
        ${x2}px ${y2}px,
        ${x2}px ${y1}px,
        ${x1}px ${y1}px
      )`;

      rafRef.current = requestAnimationFrame(update);
    }

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetRef]);

  return (
    <>
      <div ref={veilRef} className="tutorial-veil" aria-hidden="true" />
      <div
        ref={cardRef}
        className="tutorial-card arrow-none"
        role="dialog"
        aria-modal="true"
        aria-label="Tutorial"
      >
        <div className="tut-top-row">
          <div className="tut-pips">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`tut-pip ${
                  i + 1 < step ? "done" : i + 1 === step ? "active" : ""
                }`}
              />
            ))}
          </div>
          <span className="tut-step-label">
            {step} / {totalSteps}
          </span>
        </div>

        <div className="tut-accent-bar" />
        <h2 className="tut-title">{title}</h2>
        <p className="tut-desc">{description}</p>

        <div className="tut-footer">
          <button className="tut-skip-btn" onClick={onSkip}>
            Skip tutorial
          </button>
          {onNext && (
            <button
              className={`tut-next-btn ${step >= totalSteps ? "tut-finish-btn" : ""}`}
              onClick={onNext}
            >
              {step >= totalSteps ? "Finish" : "Next"}
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
