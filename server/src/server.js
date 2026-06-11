import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { onlineUsers } from "./socketStore.js";

import User from "./models/User.js";

dotenv.config();
import connectDB from "./config/db.js";

connectDB();

import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);

app.get("/", (req, res) => {
  res.send("CodeDuel API Running");
});

const PORT = process.env.PORT || 5001;

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("userOnline", async (userId) => {
    console.log("USER ONLINE EVENT:", userId);
    onlineUsers.set(userId, socket.id);
    console.log("ONLINE USERS:", [...onlineUsers.entries()]);

    await User.findByIdAndUpdate(userId, {
      isOnline: true,
    });

    for (const [userId, socketId] of onlineUsers.entries()) {
      const users = await User.find({
        isOnline: true,
        _id: { $ne: userId },
      }).select("username elo wins losses solvedProblems isInMatch");

      io.to(socketId).emit("lobbyUpdated", users);
    }
  });

  socket.on("disconnect", async () => {
    let disconnectedUserId = null;

    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      await User.findByIdAndUpdate(disconnectedUserId, {
        isOnline: false,
      });
    }

    const users = await User.find({
      isOnline: true,
    }).select("username elo wins losses solvedProblems isInMatch");

    io.emit("lobbyUpdated", users);

    console.log("User Disconnected:", socket.id);
  });

  socket.on("joinMatch", (matchId) => {
    socket.join(matchId);
  });

  socket.on("userOffline", async (userId) => {
    onlineUsers.delete(userId);

    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      isInMatch: false,
    });

    const users = await User.find({
      isOnline: true,
    }).select("username elo wins losses solvedProblems isInMatch");

    io.emit("lobbyUpdated", users);

    console.log("User logged out:", userId);
  });

  socket.on(
    "sendMatchInvite",
    async ({ matchId, opponentId, challengerId }) => {
      const opponentSocketId = onlineUsers.get(opponentId);

      const challenger = await User.findById(challengerId).select("username");

      if (opponentSocketId) {
        io.to(opponentSocketId).emit("matchInvite", {
          matchId,
          challenger: challenger?.username,
        });

        console.log("INVITE EMITTED");
      }
    },
  );
});
