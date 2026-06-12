"use client";

import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import "../css/navbar.css";
import socket from "@/lib/socket";
import getAvatar from "@/utils/getAvatar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const handleLogout = () => {
    if (user?._id) {
      socket.emit("userOffline", user._id);
    }

    socket.disconnect();

    logout();

    router.push("/login");
  };
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link href="/" className="logo">
            Code<span>Duel</span>
          </Link>

          <div className="nav-links">
            <Link
              href="/lobby"
              className={pathname === "/lobby" ? "active" : ""}
            >
              Lobby
            </Link>

            <Link
              href="/practice"
              className={pathname.startsWith("/practice") ? "active" : ""}
            >
              Practice
            </Link>

            <Link
              href="/leaderboard"
              className={pathname === "/leaderboard" ? "active" : ""}
            >
              Leaderboard
            </Link>

            <Link
              href="/tournaments"
              className={pathname === "/tournaments" ? "active" : ""}
            >
              Tournaments
            </Link>

            <Link
              href="/spectate"
              className={pathname.startsWith("/spectate") ? "active" : ""}
            >
              Spectate
            </Link>
          </div>
        </div>

        <div className="profile-menu">
          <div className="profile-avatar">
            {isAuthenticated ? (
              <img src={getAvatar(user)} alt={user.username} />
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
