import User from "../models/User.js";

export const getLeaderboardData = async () => {
  const eloLeaderboard = await User.find()
    .select("username elo wins losses")
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

  return {
    eloLeaderboard,
    solvedLeaderboard: solvedSorted,
  };
};

export const emitLeaderboardUpdate = async (io) => {
  const data = await getLeaderboardData();

  io.emit("leaderboard:update", data);
};
