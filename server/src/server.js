import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { onlineUsers } from "./socketStore.js";

import User from "./models/User.js";
import Match from "./models/Match.js";

dotenv.config();
import connectDB from "./config/db.js";

connectDB();

import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import codeRoutes from "./routes/codeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import heroRoutes from "./routes/heroRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import { getLeaderboardData } from "./services/leaderboardEmitter.js";
import profileRoutes from "./routes/profileRoutes.js";

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
app.use("/api/hero", heroRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("CodeDuel API Running");
});

const PORT = process.env.PORT || 5001;

const httpServer = createServer(app);

export const emitHeroStats = async () => {
  const playersOnline = await User.countDocuments({
    isOnline: true,
  });

  const liveMatches = await Match.find({
    status: "active",
  })
    .populate("player1Id", "username")
    .populate("player2Id", "username")
    .populate("problemId", "title difficulty")
    .limit(10);

  io.emit("heroStatsUpdated", {
    playersOnline,
    liveMatches,
  });
};

export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

httpServer.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

const formatLobbyUsers = (users) => {
  return users.map((user) => ({
    _id: user._id,
    username: user.username,
    elo: user.elo,
    wins: user.wins,
    losses: user.losses,
    isInMatch: user.isInMatch,
    solvedProblems: user.solvedProblems,
    solvedCount: user.solvedProblems?.length || 0,
  }));
};

io.on("connection", async (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("userOnline", async (userId) => {
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
    });
    await emitHeroStats();

    const users = await User.find({
      isOnline: true,
    }).select("username elo wins losses solvedProblems isInMatch");
    console.log(
      "LOBBY EMIT",
      users.map((u) => u.username),
    );

    io.emit("lobbyUpdated", formatLobbyUsers(users));
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

      await emitHeroStats();
    }

    const users = await User.find({
      isOnline: true,
    }).select("username elo wins losses solvedProblems isInMatch");
    console.log(
      "LOBBY EMIT",
      users.map((u) => u.username),
    );

    io.emit("lobbyUpdated", formatLobbyUsers(users));

    console.log("User Disconnected:", socket.id);
  });

  socket.on("joinMatch", (matchId) => {
    socket.join(matchId);
  });

  socket.on("spectate:join", (matchId) => {
    socket.join(`spectate:${matchId}`);
  });

  socket.on("spectate:leave", (matchId) => {
    socket.leave(`spectate:${matchId}`);
  });

  socket.on("match:codeUpdate", ({ matchId, playerId, code, language }) => {
    io.to(`spectate:${matchId}`).emit("spectate:codeUpdate", {
      playerId,
      code,
      language,
    });
  });

  socket.on("userOffline", async (userId) => {
    onlineUsers.delete(userId);

    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      isInMatch: false,
    });
    await emitHeroStats();

    const users = await User.find({
      isOnline: true,
    }).select("username elo wins losses solvedProblems isInMatch");
    console.log(
      "LOBBY EMIT",
      users.map((u) => u.username),
    );

    io.emit("lobbyUpdated", formatLobbyUsers(users));

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
      }
    },
  );

  socket.on("rejectMatchInvite", async ({ matchId }) => {
    try {
      const match = await Match.findById(matchId);

      if (!match) return;

      match.status = "cancelled";

      await match.save();

      await User.findByIdAndUpdate(match.player1Id, {
        isInMatch: false,
      });

      await User.findByIdAndUpdate(match.player2Id, {
        isInMatch: false,
      });

      io.emit("inviteRejected", {
        matchId,
      });

      await emitHeroStats();

      const users = await User.find({
        isOnline: true,
      }).select("username elo wins losses solvedProblems isInMatch");
      console.log(
        "LOBBY EMIT",
        users.map((u) => u.username),
      );

      io.emit("lobbyUpdated", formatLobbyUsers(users));
    } catch (error) {
      console.log(error);
    }
  });

  const leaderboardData = await getLeaderboardData();

  socket.emit("leaderboard:update", leaderboardData);
});
