import cron from "node-cron";
import DailyChallenge from "../models/DailyChallenge.js";
import Problem from "../models/Problem.js";
import { logActivity } from "../utils/activityLogger.js";
import User from "../models/User.js";
import { DAILY_BADGES } from "../utils/badgeDefinitions.js";

const awardDailyBadges = async () => {
  try {
    const yesterday = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date(Date.now() - 86400000));

    const challenge = await DailyChallenge.findOne({
      date: yesterday,
    }).populate("problemId", "title");

    if (!challenge || challenge.leaderboard.length === 0) return;

    const problemTitle = challenge.problemId?.title || "Daily Challenge";

    for (let i = 0; i < challenge.leaderboard.length; i++) {
      const entry = challenge.leaderboard[i];

      // Decide which badge based on rank
      let badgeDef;
      if (i === 0)
        badgeDef = DAILY_BADGES.daily_champion; // 🥇 #1 only
      else if (i <= 2)
        badgeDef = DAILY_BADGES.daily_podium; // 🏅 #2 and #3
      else badgeDef = DAILY_BADGES.daily_solver; // 🔥 everyone else

      const badge = {
        ...badgeDef,
        challengeId: challenge._id,
        problemTitle,
        earnedAt: new Date(),
      };

      // Avoid duplicate badges for the same challenge
      await User.updateOne(
        {
          _id: entry.userId,
          "badges.challengeId": { $ne: challenge._id },
        },
        { $push: { badges: badge } },
      );
    }

    console.log(
      `[DailyChallenge] Badges awarded for ${yesterday} — ${challenge.leaderboard.length} solvers`,
    );
  } catch (error) {
    console.error("[DailyChallenge] Badge awarding error:", error);
  }
};

export const generateDailyChallenge = async () => {
  try {
    const yesterday = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date(Date.now() - 86400000));

    const yesterdayChallenge = await DailyChallenge.findOne({
      date: yesterday,
    });

    if (yesterdayChallenge) {
      // IDs of users who completed yesterday
      const completedYesterday = yesterdayChallenge.leaderboard.map(
        (e) => e.userId,
      );

      // Everyone else with an active streak gets reset
      await User.updateMany(
        {
          _id: { $nin: completedYesterday },
          dailyChallengeStreak: { $gt: 0 },
        },
        { $set: { dailyChallengeStreak: 0 } },
      );
    }

    await awardDailyBadges();

    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    const existing = await DailyChallenge.findOne({ date: today });
    if (existing) return;

    const recent = await DailyChallenge.find()
      .sort({ createdAt: -1 })
      .limit(14)
      .select("problemId");

    const recentIds = recent.map((c) => c.problemId);

    let problems = await Problem.find({
      _id: { $nin: recentIds },
      difficulty: { $in: ["easy", "medium"] },
    });

    // Fallback: ignore recency filter if pool is exhausted
    if (!problems.length) {
      problems = await Problem.find({
        difficulty: { $in: ["easy", "medium"] },
      });
    }

    if (!problems.length) {
      console.error("[DailyChallenge] No problems available");
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
      message: `🔥 Daily Challenge is live: ${problem.title}`,
      metadata: { challengeId: challenge._id, problemId: problem._id },
    });

    console.log(`[DailyChallenge] ${today} → ${problem.title}`);
  } catch (error) {
    console.error("[DailyChallenge] Scheduler error:", error);
  }
};

export const startDailyChallengeScheduler = () => {
  generateDailyChallenge(); // catch up on startup
  cron.schedule("0 0 * * *", generateDailyChallenge); // midnight every day
};
