import User from "../models/User.js";

export const getLeaderboardData = async (req, res) => {
  try {
    const eloLeaderboard = await User.find()
      .select("username elo wins losses solvedProblems")
      .sort({ elo: -1 })
      .limit(50);

    const solvedLeaderboard = await User.find()
      .select("username elo wins losses solvedProblems");

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