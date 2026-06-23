// jobs/dailyChallengeScheduler.js

import DailyChallenge from "../models/DailyChallenge.js";
import Problem from "../models/Problem.js";
import { logActivity } from "../utils/activityLogger.js";

export const generateDailyChallenge = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const existingChallenge = await DailyChallenge.findOne({
      date: today,
    });

    if (existingChallenge) {
      return;
    }

    const recentChallenges = await DailyChallenge.find()
      .sort({ createdAt: -1 })
      .limit(14)
      .select("problemId");

    const recentProblemIds = recentChallenges.map((c) => c.problemId);

    const problems = await Problem.find({
      _id: {
        $nin: recentProblemIds,
      },

      difficulty: {
        $in: ["easy", "medium"],
      },
    });

    if (!problems.length) {
      console.log("No problems available for Daily Challenge");
      return;
    }

    const problem = problems[Math.floor(Math.random() * problems.length)];

    const challenge = await DailyChallenge.create({
      date: today,
      problemId: problem._id,
      difficulty: problem.difficulty,
      participants: 0,
      leaderboard: [],
    });

    await logActivity({
      type: "daily_challenge",
      message: `🔥 Daily Challenge is now live: ${problem.title}`,
      metadata: {
        challengeId: challenge._id,
        problemId: problem._id,
      },
    });

    console.log(`Daily Challenge created for ${today}: ${problem.title}`);
  } catch (error) {
    console.log("Daily Challenge Scheduler Error:", error);
  }
};

export const startDailyChallengeScheduler = () => {
  generateDailyChallenge();

  setInterval(
    async () => {
      await generateDailyChallenge();
    },
    60 * 60 * 1000, // check every hour
  );
};
