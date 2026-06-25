// controllers/dailyChallengeController.js

import DailyChallenge from "../models/DailyChallenge.js";
import DailyChallengeAttempt from "../models/DailyChallengeAttempt.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { logActivity } from "../utils/activityLogger.js";

export const getDailyChallenge = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const challenge = await DailyChallenge.findOne({
      date: today,
    })
      .populate("problemId")
      .populate("leaderboard.userId", "username");

    if (!challenge) {
      return res.status(404).json({
        message: "No daily challenge found",
      });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const startDailyChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    const existingAttempt = await DailyChallengeAttempt.findOne({
      challengeId,
      userId: req.user._id,
    });

    if (existingAttempt) {
      return res.json(existingAttempt);
    }

    const attempt = await DailyChallengeAttempt.create({
      challengeId,
      userId: req.user._id,
      startedAt: new Date(),
    });

    res.status(201).json(attempt);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const submitDailyChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    const challenge = await DailyChallenge.findById(challengeId);

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found",
      });
    }

    const existingEntry = challenge.leaderboard.find(
      (entry) => entry.userId.toString() === req.user._id.toString(),
    );

    if (existingEntry) {
      return res.status(400).json({
        message: "Already completed",
      });
    }

    const attempt = await DailyChallengeAttempt.findOne({
      challengeId,
      userId: req.user._id,
    });

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found",
      });
    }

    const solveTimeMs = Date.now() - new Date(attempt.startedAt).getTime();

    challenge.participants += 1;

    challenge.leaderboard.push({
      userId: req.user._id,
      username: req.user.username,
      solveTimeMs,
      completedAt: new Date(),
    });

    challenge.leaderboard.sort((a, b) => a.solveTimeMs - b.solveTimeMs);

    await challenge.save();

    const user = await User.findById(req.user._id);

    const yesterday = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date(Date.now() - 86400000));

    const yesterdayChallenge = await DailyChallenge.findOne({
      date: yesterday,
    });

    const completedYesterday = yesterdayChallenge?.leaderboard.some(
      (e) => e.userId.toString() === user._id.toString(),
    );

    user.dailyChallengesCompleted += 1;

    user.dailyChallengeStreak += 1;

    user.bestDailyChallengeStreak = Math.max(
      user.bestDailyChallengeStreak,
      user.dailyChallengeStreak,
    );

    await user.save();

    await logActivity({
      type: "daily_complete",
      message: `🔥 ${user.username} completed today's Daily Challenge`,
      userId: user._id,
    });

    io.emit(
      "dailyChallengeLeaderboardUpdated",
      challenge.leaderboard.slice(0, 10),
    );

    res.json({
      success: true,
      solveTimeMs,
      rank:
        challenge.leaderboard.findIndex(
          (e) => e.userId.toString() === user._id.toString(),
        ) + 1,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const checkDailyAttempt = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const attempt = await DailyChallengeAttempt.findOne({
      challengeId,
      userId: req.user._id,
    });

    res.json({ attempted: !!attempt });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
