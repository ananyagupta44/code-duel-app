import Match from "../models/Match.js";
import { AI_BOTS } from "../utils/aiBots.js";
import { startAiMatch } from "../services/aiEngine.js";
import Problem from "../models/Problem.js";
import User from "../models/User.js";
import { emitHeroStats } from "../server.js";
import { calculateAiElo } from "../utils/calculateAiElo.js";
import { io } from "../server.js";

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

    const playerWon = !aiWon;

    match.player1EloBefore = user.elo;

    if (playerWon) {
      const newElo = calculateAiElo(user.elo, match.aiBot.elo, 1);
console.log("Old ELO:", user.elo);
      user.elo = newElo;

      match.player1Progress = 100;

      match.player1EloAfter = newElo;
console.log("New ELO:", newElo);
      match.status = "finished";

      match.winner = "player";

      match.winnerId = user._id;

      match.endedAt = new Date();

      user.wins += 1;
    } else {
      const newElo = calculateAiElo(user.elo, match.aiBot.elo, 0);

      user.elo = newElo;

      match.player1EloAfter = newElo;

      match.status = "finished";

      match.winner = "ai";

      match.endedAt = new Date();

      user.losses += 1;
    }

    user.isInMatch = false;

    await user.save();
    console.log("User saved");
    await match.save();

    io.to(match._id.toString()).emit("matchFinished", {
      matchId: match._id,
      winner: match.winner,
    });

    io.to(match._id.toString()).emit("eloUpdated", {
      oldElo: match.player1EloBefore,
      newElo: match.player1EloAfter,
    });

    return res.json({
      success: true,

      winner: match.winner,

      eloBefore: match.player1EloBefore,

      eloAfter: match.player1EloAfter,

      eloChange: match.player1EloAfter - match.player1EloBefore,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};
