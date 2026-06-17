// controllers/tournamentController.js

import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";

export const createTournament = async (req, res) => {
  try {
    const {
      name,
      description,
      maxParticipants,
      startDate,
      endDate,
      difficulty,
      prizePool,
    } = req.body;

    const tournament = await Tournament.create({
      name,
      description,
      maxParticipants,
      startDate,
      endDate,
      difficulty,
      prizePool,

      registrationDeadline: startDate,

      status: "upcoming",
    });

    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status !== "upcoming") {
      return res.status(400).json({
        message: "Tournament already started",
      });
    }

    const alreadyJoined = tournament.participants.some(
      (id) => id.toString() === req.user._id.toString(),
    );

    if (alreadyJoined) {
      return res.status(400).json({
        message: "Already joined tournament",
      });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({
        message: "Tournament full",
      });
    }

    tournament.participants.push(req.user._id);

    await tournament.save();

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .sort({
        startDate: 1,
      })
       .populate(
        "participants",
        "username elo"
      )
      .populate(
        "winnerId",
        "username"
      );

    res.json(tournaments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate("participants", "username elo")
      .populate("winnerId", "username")
      .populate(
        "bracket.matches.player1Id",
        "username elo"
      )
      .populate(
        "bracket.matches.player2Id",
        "username elo"
      )
      .populate(
        "bracket.matches.winnerId",
        "username"
      );

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    res.json(tournament);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const startTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);

    if (!tournament) {
      return res.status(404).json({
        message: "Tournament not found",
      });
    }

    if (tournament.status !== "upcoming") {
      return res.status(400).json({
        message: "Tournament already started",
      });
    }

    if (tournament.participants.length < 2) {
      return res.status(400).json({
        message: "Not enough participants",
      });
    }

    // Fetch players and seed by ELO
    const players = await User.find({
      _id: {
        $in: tournament.participants,
      },
    }).sort({
      elo: -1,
    });

    // Ensure power of 2
    const count = players.length;

    if ((count & (count - 1)) !== 0) {
      return res.status(400).json({
        message: "Tournament participants must be a power of 2 (4,8,16,32...)",
      });
    }

    // Pick tournament problem
    const problems = await Problem.find();

    if (!problems.length) {
      return res.status(400).json({
        message: "No problems found",
      });
    }

    const bracketMatches = [];
    const createdMatchIds = [];

    for (let i = 0; i < players.length / 2; i++) {
      const player1 = players[i];
      const player2 = players[players.length - 1 - i];

      const problem = problems[Math.floor(Math.random() * problems.length)];

      const match = await Match.create({
        player1Id: player1._id,
        player2Id: player2._id,
        tournamentId: tournament._id,

        problemId: problem._id,

        matchType: "tournament",

        difficulty: problem.difficulty,

        status: "waiting",

        durationSecs: 1800,
      });

      createdMatchIds.push(match._id);

      bracketMatches.push({
        matchId: match._id,

        player1Id: player1._id,
        player2Id: player2._id,

        winnerId: null,
      });
    }

    tournament.matchIds = createdMatchIds;

    tournament.bracket = [
      {
        round: 1,
        matches: bracketMatches,
      },
    ];

    tournament.currentRound = 1;

    tournament.totalRounds = Math.log2(players.length);

    tournament.status = "active";

    await tournament.save();

    res.json({
      message: "Tournament started",
      tournament,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
