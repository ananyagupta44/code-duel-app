"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import socket from "@/lib/socket";
import MatchInviteModal from "./MatchInviteModal";
import api from "@/lib/api";

export default function SocketProvider({ children }) {
  const router = useRouter();
  const { user } = useAuth();

  const [invite, setInvite] = useState(null);

  // Ensure socket is connected
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    console.log("SocketProvider Mounted");
  }, []);

  // Re-register user after every reconnect
  useEffect(() => {
    if (!user?._id) return;

    const registerUser = () => {
      console.log("REGISTERING USER:", user._id);

      socket.emit("userOnline", user._id);
    };

    socket.on("connect", registerUser);

    if (socket.connected) {
      registerUser();
    }

    return () => {
      socket.off("connect", registerUser);
    };
  }, [user]);

  useEffect(() => {
    const handleInvite = (data) => {
      console.log("MATCH INVITE RECEIVED ON CLIENT", data);

      setInvite(data);
    };

    const handleAccepted = ({ matchId }) => {
      console.log("MATCH ACCEPTED RECEIVED:", matchId);
      router.push(`/duel/${matchId}`);
    };

    socket.on("matchInvite", handleInvite);

    socket.on("matchAccepted", handleAccepted);

    return () => {
      socket.off("matchInvite", handleInvite);

      socket.off("matchAccepted", handleAccepted);
    };
  }, [router]);

  const acceptInvite = async (matchId) => {
    try {
      await api.post(`/matches/${matchId}/accept`);

      setInvite(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {children}

      <MatchInviteModal
        invite={invite}
        onAccept={acceptInvite}
        onReject={() => setInvite(null)}
      />
    </>
  );
}
