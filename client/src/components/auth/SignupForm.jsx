"use client";

import { useState } from "react";
import { useAuthDrawer } from "@/context/drawerContext";
import { useAuth } from "@/context/authContext";
import api from "@/lib/api";
import "./authForm.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import socket from "@/lib/socket";

export default function SignupForm() {
  const { openLogin, closeDrawer } = useAuthDrawer();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

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

      const res = await api.post("/auth/register", formData);

      login(res.data);

      closeDrawer();
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div>
      <h2 className="auth-title">Create Account</h2>

      <p className="auth-subtitle">Join the CodeDuel arena.</p>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="auth-input"
        />

        <input
          name="email"
          type="email"
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

        <button type="submit" className="auth-btn register">
          {loading ? "Creating..." : "Create Account"}
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
        Already have an account?
        <button onClick={openLogin} className="auth-switch">
          Login
        </button>
      </div>
    </div>
  );
}
