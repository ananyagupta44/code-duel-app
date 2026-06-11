import Problem from "../models/Problem.js";
import { executeCode } from "../services/codeExecutor.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";

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
