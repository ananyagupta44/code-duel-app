import Match from "../models/Match.js";
import { AI_BOTS } from "../utils/aiBots.js";
import { startAiMatch } from "../services/aiEngine.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";
import { emitHeroStats } from "../server.js";
import { calculateAiElo } from "../utils/calculateAiElo.js";
import { io } from "../server.js";
import { logActivity } from "../utils/activityLogger.js";

export const createAiMatch = async (req, res) => {
  try {
    console.log("AI route hit");
    const { topic, difficulty, botId } = req.body;

    const bot = AI_BOTS[botId];

    if (!bot) {
      return res.status(400).json({
        message: "Invalid AI bot",
      });
    }

    const filter = {};

    if (difficulty !== "random") {
      filter.difficulty = difficulty;
    }

    if (topic !== "random") {
      filter.topic = topic;
    }

    const problems = await Problem.find(filter);

    if (!problems.length) {
      return res.status(404).json({
        message: "No problem found",
      });
    }

    const problem = problems[Math.floor(Math.random() * problems.length)];

    const match = await Match.create({
      player1Id: req.user._id,

      aiBot: {
        id: bot.id,
        name: bot.name,
        elo: bot.elo,
      },

      problemId: problem._id,

      difficulty: difficulty === "random" ? problem.difficulty : difficulty,

      matchType: "ai",

      isAiMatch: true,

      status: "active",

      startedAt: new Date(),

      durationSecs: 1800,

      player1Progress: 0,
      player2Progress: 0,
    });

    await User.findByIdAndUpdate(req.user._id, {
      isInMatch: true,
    });

    startAiMatch(match);

    await emitHeroStats();

    await logActivity({
      type: "ai_match",
      message: `🤖 ${req.user.username} challenged ${bot.name}`,
      userId: req.user._id,
    });

    res.json({
      matchId: match._id,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const handleAiMatchSubmit = async (req, res, match) => {
  try {
    console.log("AI submit handler hit");

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (match.status === "finished") {
      return res.status(400).json({
        message: "Match already finished",
      });
    }

    const aiWon = match.player2Progress >= 100;

    if (aiWon) {
      await finishAiMatch(match, "ai");
    } else {
      match.player1Progress = 100;

      await finishAiMatch(match, "player");
    }

    return res.json({
      success: true,
      winner: aiWon ? "ai" : "player",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

export const finishAiMatch = async (match, winner) => {
  const freshMatch = await Match.findById(match._id);

  if (!freshMatch || freshMatch.status === "finished") {
    return;
  }

  const user = await User.findById(freshMatch.player1Id);

  if (!user) return;

  freshMatch.player1EloBefore = user.elo;

  if (winner === "player") {
    const newElo = calculateAiElo(user.elo, match.aiBot.elo, 1);

    user.elo = newElo;
    user.wins += 1;

    freshMatch.player1EloAfter = newElo;
    freshMatch.winner = "player";
    freshMatch.winnerId = user._id;
  } else {
    const newElo = calculateAiElo(user.elo, match.aiBot.elo, 0);

    user.elo = newElo;
    user.losses += 1;

    freshMatch.player1EloAfter = newElo;
    freshMatch.winner = "ai";
    freshMatch.loserId = user._id;
  }

  user.isInMatch = false;

  freshMatch.status = "finished";
  freshMatch.endedAt = new Date();

  await user.save();
  await freshMatch.save();

  io.to(match._id.toString()).emit("matchFinished", {
    matchId: match._id,
    winner: match.winner,
  });

  io.to(match._id.toString()).emit("eloUpdated", {
    oldElo: match.player1EloBefore,
    newElo: match.player1EloAfter,
  });

  await emitHeroStats();

  return {
    winner: freshMatch.winner,
    eloBefore: freshMatch.player1EloBefore,
    eloAfter: freshMatch.player1EloAfter,
  };
};
