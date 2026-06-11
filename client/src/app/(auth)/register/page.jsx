"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { fjalla, chivo } from "@/fonts";
import { useAuth } from "@/context/authContext";

export default function Register() {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
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
      const res = await api.post("/auth/register", formData);
      login(res.data);
      router.push("/");
    } catch (error) {
      console.log(error.response?.data);
      alert(error.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1 className={fjalla.className}>Create Account</h1>

        <input
          className={chivo.className}
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

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
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className={chivo.className}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </form>
    </main>
  );
}
