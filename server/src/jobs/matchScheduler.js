import cron from "node-cron";
import Match from "../models/Match.js";
import Tournament from "../models/Tournament.js";
import { io } from "../server.js";
import { onlineUsers } from "../socketStore.js";

export const startMatchScheduler = () => {
  cron.schedule("*/10 * * * * *", async () => {
    const now = new Date();

    const matches = await Match.find({
      status: "waiting",
      startTime: { $lte: now },
      matchType: "tournament",
    })
      .populate("player1Id", "username")
      .populate("player2Id", "username")
      .populate("tournamentId", "name");

    for (const match of matches) {
      match.status = "active";
      match.startedAt = new Date();

      await match.save();

      const p1Socket = onlineUsers.get(match.player1Id._id.toString());

      const p2Socket = onlineUsers.get(match.player2Id._id.toString());

      if (p1Socket) {
        io.to(p1Socket).emit("tournamentMatchReady", {
          matchId: match._id,
          tournamentId: match.tournamentId._id,
          tournamentName: match.tournamentId.name,
          opponentName: match.player2Id.username,
        });
      }

      if (p2Socket) {
        io.to(p2Socket).emit("tournamentMatchReady", {
          matchId: match._id,
          tournamentId: match.tournamentId._id,
          tournamentName: match.tournamentId.name,
          opponentName: match.player1Id.username,
        });
      }
    }
  });
};
