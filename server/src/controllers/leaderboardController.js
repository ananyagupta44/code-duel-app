import User from "../models/User.js";
import Problem from "../models/Problem.js";

export const getLeaderboardData = async (req, res) => {
  try {
    const eloLeaderboard = await User.find()
      .select("username elo wins losses solvedProblems")
      .sort({ elo: -1 })
      .limit(50);

    const solvedLeaderboard = await User.find().select(
      "username elo wins losses solvedProblems",
    );

    const solvedSorted = solvedLeaderboard
      .map((user) => ({
        _id: user._id,
        username: user.username,
        elo: user.elo,
        wins: user.wins,
        losses: user.losses,
        solvedCount: user.solvedProblems.length,
      }))
      .sort((a, b) => b.solvedCount - a.solvedCount)
      .slice(0, 50);

    res.status(200).json({
      eloLeaderboard,
      solvedLeaderboard: solvedSorted,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch leaderboard",
    });
  }
};

export const getMyLeaderboardStats = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // =====================
    // ELO DATA
    // =====================

    const rank =
      (await User.countDocuments({
        elo: { $gt: currentUser.elo },
      })) + 1;

    const totalPlayers = await User.countDocuments();

    const percentile = Math.round(((totalPlayers - rank) / totalPlayers) * 100);

    const nextPlayer = await User.findOne({
      elo: { $gt: currentUser.elo },
    })
      .sort({ elo: 1 })
      .select("username elo");

    const pointsToNext = nextPlayer ? nextPlayer.elo - currentUser.elo : 0;

    // =====================
    // SOLVED DATA
    // =====================

    const solvedSlugs = currentUser.solvedProblems || [];

    const solvedProblems = await Problem.find({
      slug: { $in: solvedSlugs },
    }).select("difficulty topic");

    const difficultyBreakdown = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    const topicMap = {};

    solvedProblems.forEach((problem) => {
      difficultyBreakdown[problem.difficulty]++;

      topicMap[problem.topic] = (topicMap[problem.topic] || 0) + 1;
    });

    const topicBreakdown = Object.entries(topicMap)
      .map(([topic, count]) => ({
        topic,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const allUsers = await User.find().select("elo");

    const userElo = currentUser.elo;

    const eloDistribution = [
      { range: "0-999", count: 0, isUser: false },
      { range: "1000-1199", count: 0, isUser: false },
      { range: "1200-1399", count: 0, isUser: false },
      { range: "1400-1599", count: 0, isUser: false },
      { range: "1600-1799", count: 0, isUser: false },
      { range: "1800+", count: 0, isUser: false },
    ];

    allUsers.forEach((user) => {
      const elo = user.elo;

      if (elo < 1000) {
        eloDistribution[0].count++;
      } else if (elo < 1200) {
        eloDistribution[1].count++;
      } else if (elo < 1400) {
        eloDistribution[2].count++;
      } else if (elo < 1600) {
        eloDistribution[3].count++;
      } else if (elo < 1800) {
        eloDistribution[4].count++;
      } else {
        eloDistribution[5].count++;
      }

      if (userElo < 1000) {
        eloDistribution[0].isUser = true;
      } else if (userElo < 1200) {
        eloDistribution[1].isUser = true;
      } else if (userElo < 1400) {
        eloDistribution[2].isUser = true;
      } else if (userElo < 1600) {
        eloDistribution[3].isUser = true;
      } else if (userElo < 1800) {
        eloDistribution[4].isUser = true;
      } else {
        eloDistribution[5].isUser = true;
      }
    });

    res.status(200).json({
      elo: {
        rank,
        elo: currentUser.elo,
        wins: currentUser.wins,
        losses: currentUser.losses,
        percentile,
        pointsToNext,
        nextPlayer,
        currentStreak: currentUser.currentStreak,
        bestStreak: currentUser.bestStreak,
      },
      solved: {
        totalSolved: solvedSlugs.length,
        difficultyBreakdown,
        topicBreakdown,
      },
      eloDistribution,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch user stats",
    });
  }
};
