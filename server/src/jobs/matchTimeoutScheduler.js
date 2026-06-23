import Match from "../models/Match.js";
import User from "../models/User.js";
import { io, emitHeroStats } from "../server.js";
import { logActivity } from "../utils/activityLogger.js";

export const checkMatchTimeouts = async () => {
  try {
    const activeMatches = await Match.find({
      status: "active",
    })
      .populate("player1Id", "username")
      .populate("player2Id", "username");

    for (const match of activeMatches) {
      const endTime =
        new Date(match.startedAt).getTime() + match.durationSecs * 1000;

      if (Date.now() < endTime) continue;

      if (match.status === "finished") continue;

      let winner = null;
      let loser = null;

      // Higher progress wins
      if (match.player1Progress > match.player2Progress) {
        winner = match.player1Id;
        loser = match.player2Id;
      } else if (match.player2Progress > match.player1Progress) {
        winner = match.player2Id;
        loser = match.player1Id;
      }

      match.status = "finished";
      match.endedAt = new Date();

      // Draw
      if (!winner) {
        await User.findByIdAndUpdate(match.player1Id._id, {
          isInMatch: false,
        });

        await User.findByIdAndUpdate(match.player2Id._id, {
          isInMatch: false,
        });

        await logActivity({
          type: "match_draw",
          message: `🤝 ${match.player1Id.username} and ${match.player2Id.username} drew their duel`,
          metadata: {
            matchId: match._id,
          },
        });

        await match.save();

        io.to(match._id.toString()).emit("matchFinished", {
          matchId: match._id,
          reason: "timeout",
          draw: true,
        });

        continue;
      }

      match.winnerId = winner._id;
      match.loserId = loser._id;

      await User.findByIdAndUpdate(winner._id, {
        $inc: { wins: 1 },
        isInMatch: false,
      });

      await User.findByIdAndUpdate(loser._id, {
        $inc: { losses: 1 },
        isInMatch: false,
      });

      await logActivity({
        type: "match_timeout",
        message: `⏰ ${winner.username} defeated ${loser.username} on time`,
        userId: winner._id,
        metadata: {
          matchId: match._id,
        },
      });

      await match.save();

      io.to(match._id.toString()).emit("matchFinished", {
        matchId: match._id,
        winnerId: winner._id,
        loserId: loser._id,
        reason: "timeout",
      });

      io.to(`spectate:${match._id}`).emit("spectate:event", {
        type: "timeout",
        message: `⏰ Match timer expired`,
        timestamp: Date.now(),
      });
    }

    await emitHeroStats();
  } catch (error) {
    console.log("Match timeout scheduler:", error);
  }
};

export const startMatchTimeoutScheduler = () => {
  setInterval(checkMatchTimeouts, 10000);
};
