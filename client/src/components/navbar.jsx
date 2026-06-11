"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import "../css/navbar.css";
import socket from "@/lib/socket";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  const router = useRouter();

  const handleLogout = () => {
  if (user?._id) {
    socket.emit("userOffline", user._id);
  }

  socket.disconnect();

  logout();

  router.push("/login");
};

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="logo">
          Code<span>Duel</span>
        </Link>

        <div className="nav-links">
          <Link href="/lobby">Lobby</Link>
          <Link href="/practice">Practice</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/tournaments">Tournaments</Link>
          <Link href="/spectate">Spectate</Link>
        </div>

        <div className="profile-menu">
          <div className="profile-avatar">
            {isAuthenticated ? (
              user?.username?.charAt(0).toUpperCase()
            ) : (
              <CircleUserRound size={28} />
            )}
          </div>

          <div className="dropdown">
            {!isAuthenticated ? (
              <>
                <Link href="/login">Login</Link>

                <Link href="/register">Register</Link>
              </>
            ) : (
              <>
                <div className="user-info">{user.username}</div>

                <Link href="/dashboard">Dashboard</Link>

                <Link href="/profile">Profile</Link>

                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
