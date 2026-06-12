import User from "../models/User.js";
import Match from "../models/Match.js";

export const getHeroStats = async (req, res) => {
  try {
    const playersOnline =
      await User.countDocuments({
        isOnline: true,
      });

    const liveMatches = await Match.find({
      status: "active",
    })
      .populate("player1Id", "username")
      .populate("player2Id", "username")
      .sort({ startedAt: -1 })
      .limit(10);

    res.status(200).json({
      playersOnline,
      liveMatches,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};