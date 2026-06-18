import Problem from "../models/Problem.js";
import { executeCode } from "../services/codeExecutor.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import Match from "../models/Match.js";
import MatchSubmission from "../models/MatchSubmission.js";
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find().select("username solvedProblems");

    const leaderboard = users
      .map((user) => ({
        _id: user._id,
        username: user.username,
        solved: user.solvedProblems?.length || 0,
      }))
      .sort((a, b) => b.solved - a.solved)
      .slice(0, 10);

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const rank =
      (await User.countDocuments({ elo: { $gt: currentUser.elo } })) + 1;

    const buildEloHistory = async (userId) => {
      const matches = await Match.find({
        status: "finished",

        $or: [{ player1Id: userId }, { player2Id: userId }],

        matchType: {
          $in: ["ranked", "ai"],
        },
      }).sort({
        endedAt: 1,
      });

      const validMatches = matches.filter((match) => {
        const isPlayer1 = match.player1Id?.toString() === userId.toString();

        const elo = isPlayer1 ? match.player1EloAfter : match.player2EloAfter;

        return elo !== undefined && elo !== null;
      });

      return validMatches.map((match, index) => {
        const isPlayer1 = match.player1Id.toString() === userId.toString();

        return {
          match: index + 1,
          elo: isPlayer1 ? match.player1EloAfter : match.player2EloAfter,
        };
      });
    };

    async function buildDailyActivity(userId) {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const matches = await Match.find({
        $or: [{ player1Id: userId }, { player2Id: userId }],
        status: "finished",
        endedAt: { $gte: fourteenDaysAgo },
      }).select("winnerId endedAt");

      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const dayLabel = d.toLocaleDateString("en-US", {
          weekday: "short",
        });

        const dayMatches = matches.filter((m) => {
          const md = new Date(m.endedAt);
          md.setHours(0, 0, 0, 0);
          return md.getTime() === d.getTime();
        });

        const wins = dayMatches.filter(
          (m) => m.winnerId?.toString() === userId.toString(),
        ).length;
        const losses = dayMatches.length - wins;

        days.push({ day: dayLabel, wins, losses });
      }

      return days;
    }

    const buildActivityHeatmap = async (userId) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 181);
      startDate.setHours(0, 0, 0, 0);

      const practiceSubs = await Submission.find({
        user: userId,
        createdAt: {
          $gte: startDate,
        },
      }).select("createdAt");

      const matchSubs = await MatchSubmission.find({
        userId,
        submittedAt: {
          $gte: startDate,
        },
      }).select("submittedAt");

      const allSubmissions = [...practiceSubs, ...matchSubs];

      const activityMap = {};

      practiceSubs.forEach((submission) => {
        const key = new Date(submission.createdAt).toLocaleDateString("en-CA");

        activityMap[key] = (activityMap[key] || 0) + 1;
      });

      matchSubs.forEach((submission) => {
        const key = new Date(submission.submittedAt).toLocaleDateString(
          "en-CA",
        );

        activityMap[key] = (activityMap[key] || 0) + 1;
      });

      const cells = [];

      for (let i = 181; i >= 0; i--) {
        const date = new Date();

        date.setDate(date.getDate() - i);

        const key = date.toLocaleDateString("en-CA");

        const count = activityMap[key] || 0;

        let level = 0;

        if (count >= 1) level = 1;
        if (count >= 3) level = 2;
        if (count >= 5) level = 3;
        if (count >= 8) level = 4;

        cells.push({
          date: key,
          count,
          level,
        });
      }

      return cells;
    };

    // SOLVED BREAKDOWN
    const solvedSlugs = currentUser.solvedProblems || [];
    const solvedProblems = await Problem.find({
      slug: { $in: solvedSlugs },
    }).select("difficulty topic");

    const difficultyBreakdown = { easy: 0, medium: 0, hard: 0 };
    const topicMap = {};

    solvedProblems.forEach((p) => {
      if (difficultyBreakdown[p.difficulty] !== undefined) {
        difficultyBreakdown[p.difficulty]++;
      }
      topicMap[p.topic] = (topicMap[p.topic] || 0) + 1;
    });

    const topicBreakdown = Object.entries(topicMap)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    const recentMatchesRaw = await Match.find({
      $or: [{ player1Id: currentUser._id }, { player2Id: currentUser._id }],
      status: "finished",
    })
      .sort({ endedAt: -1 })
      .limit(10)
      .populate("problemId", "title")
      .populate("player1Id", "username")
      .populate("player2Id", "username");

    const recentMatches = recentMatchesRaw.map((m) => {
      const isPlayer1 =
        m.player1Id._id.toString() === currentUser._id.toString();
      let opponent;

      if (m.matchType === "ai") {
        opponent = {
          username: m.aiBot?.name || "AI Bot",
        };
      } else {
        opponent = isPlayer1 ? m.player2Id : m.player1Id;
      }
      const isWin = m.winnerId?.toString() === currentUser._id.toString();

      const duration =
        m.startedAt && m.endedAt
          ? Math.floor((new Date(m.endedAt) - new Date(m.startedAt)) / 1000)
          : 0;
      const mins = Math.floor(duration / 60);
      const secs = duration % 60;

      const eloChange =
        m.matchType === "ranked"
          ? isPlayer1
            ? (m.player1EloAfter ?? m.player1EloBefore ?? 0) -
              (m.player1EloBefore ?? 0)
            : (m.player2EloAfter ?? m.player2EloBefore ?? 0) -
              (m.player2EloBefore ?? 0)
          : null;

      return {
        _id: m._id,
        problemTitle: m.problemId?.title || "Unknown",
        opponentUsername: opponent?.username || "Unknown",
        matchType: m.matchType,
        duration: `${mins}:${String(secs).padStart(2, "0")}`,
        isWin,
        eloChange,
        timeAgo: timeAgoFormat(m.endedAt),
      };
    });

    // ELO HISTORY (placeholder — needs an EloHistory model or snapshot collection)
    const eloHistory = await buildEloHistory(currentUser._id);

    // DAILY ACTIVITY (last 14 days)
    const dailyActivity = await buildDailyActivity(currentUser._id);

    // ACTIVITY HEATMAP (26 weeks x 7 days)
    const activityHeatmap = await buildActivityHeatmap(currentUser._id);
    console.log("ELO HISTORY", eloHistory);
    res.status(200).json({
      username: currentUser.username,
      elo: currentUser.elo,
      rank,
      wins: currentUser.wins,
      losses: currentUser.losses,
      totalSolved: solvedSlugs.length,
      difficultyBreakdown,
      topicBreakdown,
      createdAt: currentUser.createdAt,
      recentMatches,
      eloHistory,
      dailyActivity,
      activityHeatmap,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

function timeAgoFormat(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
