"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

import LoginForm from "./loginForm";
import SignupForm from "./SignupForm";

import { useAuthDrawer } from "@/context/drawerContext";

import "./authDrawer.css";

export default function AuthDrawer() {
  const { isOpen, closeDrawer, mode } = useAuthDrawer();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeDrawer]);

  return (
    <>
      <div
        className={`auth-backdrop ${isOpen ? "open" : ""}`}
        onClick={closeDrawer}
      />

      <aside
        className={`auth-drawer ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="drawer-glow"></div>

        <div className="drawer-header">
          <div>
            <h2>
              Code<span>Duel</span>
            </h2>
            <p>Compete. Solve. Climb.</p>
          </div>
          <button className="drawer-close" onClick={closeDrawer}>
            <X size={18} />
          </button>
        </div>

        <div className="drawer-content">
          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </div>
      </aside>
    </>
  );
}
