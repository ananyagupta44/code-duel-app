"use client";

import { useState } from "react";
import { useAuthDrawer } from "@/context/drawerContext";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import socket from "@/lib/socket";
import "./authForm.css";
import { fjalla } from "@/fonts";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginForm() {
  const { openSignup, closeDrawer } = useAuthDrawer();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      socket.connect();
      socket.emit("userOnline", res.data._id);

      login(res.data);

      closeDrawer();
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await api.post("/auth/login", formData);
      socket.connect();
      socket.emit("userOnline", res.data._id);
      login(res.data);
      closeDrawer();
    } catch (error) {
      alert(error.response?.data?.message || error.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className={`auth-title ${fjalla.className}`}>Welcome Back</h2>

      <p className="auth-subtitle">Login to continue dueling.</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="auth-input"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="auth-input"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>

        <button type="submit" className="auth-btn">
          {loading ? "Logging In..." : "Login"}
        </button>
      </form>

      <div className="auth-divider">
        <span>OR</span>
      </div>

      <div className="google-login">
        <GoogleLogin
          theme="filled_black"
          shape="pill"
          size="large"
          text="continue_with"
          width="320"
          onSuccess={handleGoogleLogin}
          onError={() => console.log("Google Login Failed")}
        />
      </div>

      <div className="auth-footer">
        Don't have an account?
        <button onClick={openSignup} className="auth-switch">
          Sign Up
        </button>
      </div>
    </div>
  );
}
