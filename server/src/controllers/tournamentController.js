// controllers/tournamentController.js

import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import { onlineUsers } from "../socketStore.js";
import { io } from "../server.js";
import { startTournamentInternal } from "../services/tournamentEngine.js";

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
      createdBy: req.user._id,
      registrationDeadline: startDate,
      status: "upcoming",
    });
    if (!name || !startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    if (new Date(startDate) <= new Date()) {
      return res.status(400).json({
        message: "Start date must be in future",
      });
    }
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

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
      .populate("participants", "username elo")
      .populate("winnerId", "username");

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
      .populate("bracket.matches.player1Id", "username elo")
      .populate("bracket.matches.player2Id", "username elo")
      .populate("bracket.matches.winnerId", "username");

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
    const tournament = await startTournamentInternal(req.params.id);

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

export const getMyTournamentMatch = async (req, res) => {
  const userId = req.user._id;

  const match = await Match.findOne({
    matchType: "tournament",
    status: { $in: ["waiting", "active"] },
    $or: [{ player1Id: userId }, { player2Id: userId }],
  })
    .sort({ startTime: 1 })
    .populate("tournamentId", "name")
    .populate("player1Id", "username")
    .populate("player2Id", "username");

  if (!match) {
    return res.json(null);
  }
  res.json(match);
};

export const getMyActiveTournamentMatch = async (req, res) => {
  const userId = req.user._id;

  const match = await Match.findOne({
    matchType: "tournament",
    status: "active",
    $or: [{ player1Id: userId }, { player2Id: userId }],
  })
    .populate("tournamentId", "name")
    .populate("player1Id", "username")
    .populate("player2Id", "username");

  res.json(match);
};
