"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { fjalla, chivo } from "@/fonts";
import { Chivo } from "next/font/google";
import { useAuth } from "@/context/authContext";
import socket from "@/lib/socket";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

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

      router.push("/dashboard");

      router.push("/");
    } catch (error) {
      console.log("LOGIN ERROR:", error);
      console.log("RESPONSE:", error.response?.data);
      console.log("STATUS:", error.response?.status);

      alert(JSON.stringify(error.response?.data) || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className={fjalla.className}>Login</h1>

        <input
          className={chivo.className}
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          className={chivo.className}
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button className={fjalla.className} type="submit">
          {loading ? "Logging In..." : "Login"}{" "}
        </button>

        <p className={chivo.className}>
          Don't have an account?{" "}
          <a href="/register" className={chivo.className}>
            Create One
          </a>
        </p>
      </form>
    </main>
  );
}
