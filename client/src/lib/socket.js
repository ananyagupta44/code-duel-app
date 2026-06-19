// src/lib/socket.js

import { io } from "socket.io-client";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001",
  {
    autoConnect: false,
    transports: ["websocket"],
  },
);

export default socket;
