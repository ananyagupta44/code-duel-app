import Match from "../models/Match.js";
import MatchSubmission from "../models/MatchSubmission.js";
import Problem from "../models/Problem.js";
import { onlineUsers } from "../socketStore.js";
import User from "../models/User.js";
import Tournament from "../models/Tournament.js";
import { advanceTournament } from "../services/tournamentEngine.js";
import { emitHeroStats, io } from "../server.js";
import { executeCode } from "../services/codeExecutor.js";
import {
  generateCppWrapper,
  generateJSWrapper,
  generatePythonWrapper,
} from "../services/wrapperGenerator.js";
import { emitLeaderboardUpdate } from "../services/leaderboardEmitter.js";
import { handleAiMatchSubmit } from "./aiController.js";

const saveMatchCode = async ({ match, userId, code, language }) => {
  if (match.player1Id.toString() === userId.toString()) {
    match.player1Submission = {
      ...match.player1Submission,
      code,
      language,
      submittedAt: new Date(),
    };
  } else {
    match.player2Submission = {
      ...match.player2Submission,
      code,
      language,
      submittedAt: new Date(),
    };
  }

  await match.save();
};

export const createMatch = async (req, res) => {
  try {
    const { opponentId, matchType, difficulty = "medium" } = req.body;

    const player1Id = req.user._id;

    const filter = {};

    if (difficulty !== "random") {
      filter.difficulty = difficulty;
    }

    const problems = await Problem.find(filter);

    const problem = problems[Math.floor(Math.random() * problems.length)];

    const match = await Match.create({
      problemId: problem._id,
      difficulty: difficulty === "random" ? problem.difficulty : difficulty,
      player2Id: opponentId,
      player1Id,
      matchType,
      status: "waiting",
      player1Progress: 0,
      player2Progress: 0,
      durationSecs: 1800,
    });

    await User.findByIdAndUpdate(player1Id, {
      isInMatch: true,
    });

    await User.findByIdAndUpdate(opponentId, {
      isInMatch: true,
    });

    const users = await User.find({
      isOnline: true,
    }).select("username elo wins losses solvedProblems isInMatch");

    const rankedUsers = users
      .map((user) => ({
        ...user.toObject(),
        solvedCount: user.solvedProblems.length,
      }))
      .sort((a, b) => b.solvedCount - a.solvedCount);

    io.emit("lobbyUpdated", rankedUsers);

    const opponentSocket = onlineUsers.get(opponentId.toString());

    if (opponentSocket) {
      io.to(opponentSocket).emit("matchInvite", {
        matchId: match._id,
        challenger: req.user.username,
      });
    }

    res.status(201).json(match);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getMatchById = async (req, res) => {
  try {
    const { matchId } = req.params;

    const match = await Match.findById(matchId)
      .populate("problemId")
      .populate("player1Id", "username elo wins losses")
      .populate("player2Id", "username elo wins losses")
      .populate("winnerId", "username elo wins losses")
      .populate("loserId", "username elo wins losses");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    res.status(200).json(match);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const submitMatchSolution = async (req, res) => {
  try {
    const { matchId } = req.params;

    const { language, code } = req.body;

    const userId = req.user._id;

    const match = await Match.findById(matchId).populate("problemId");

    if (match.matchType === "ai") {
      return handleAiMatchSubmit(req, res, match);
    }

    await saveMatchCode({
      match,
      userId,
      code,
      language,
    });

    io.to(`spectate:${match._id}`).emit("spectate:codeUpdate", {
      playerId: userId,
      code,
      language,
    });

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const isParticipant =
      match.player1Id.toString() === userId.toString() ||
      match.player2Id.toString() === userId.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message: "Not a participant of this match",
      });
    }

    if (match.status === "finished") {
      return res.status(400).json({
        message: "Match already finished",
      });
    }

    const problem = match.problemId;

    let passed = 0;
    let verdict = "accepted";

    for (const tc of problem.testCases) {
      try {
        let executableCode;

        if (language === "javascript") {
          executableCode = generateJSWrapper(
            code,
            problem.functionName,
            tc.input,
          );
        }

        if (language === "python") {
          executableCode = generatePythonWrapper(
            code,
            problem.functionName,
            tc.input,
          );
        }

        if (language === "cpp") {
          executableCode = generateCppWrapper(
            code,
            problem.functionName,
            tc.input,
          );
        }

        const result = await executeCode(language, executableCode);

        const normalize = (str) =>
          str.replace(/\r\n/g, "\n").replace(/\s+/g, "").toLowerCase().trim();

        const normalizedOutput = normalize(result);

        const normalizedExpected = normalize(tc.expectedOutput);

        if (normalizedOutput === normalizedExpected) {
          passed++;
        }
      } catch (error) {
        console.log(error);

        verdict = "RE";
        break;
      }
    }
    const player = await User.findById(userId).select("username");

    io.to(`spectate:${match._id}`).emit("spectate:event", {
      type: "tests",
      message: `✓ ${player.username} passed ${passed}/${problem.testCases.length} tests`,
      timestamp: Date.now(),
    });

    if (verdict !== "RE") {
      verdict = passed === problem.testCases.length ? "accepted" : "WA";
    }

    await MatchSubmission.create({
      matchId,
      userId,
      code,
      language,
      verdict,
      passed,
      total: problem.testCases.length,
    });

    const progress = Math.floor((passed / problem.testCases.length) * 100);

    io.to(`spectate:${match._id}`).emit("spectate:event", {
      type: "progress",
      message: `🚀 ${player.username} reached ${progress}%`,
      timestamp: Date.now(),
    });

    if (match.player1Id.toString() === userId.toString()) {
      match.player1Progress = Math.max(match.player1Progress, progress);
    } else {
      match.player2Progress = Math.max(match.player2Progress, progress);
    }

    // winner logic
    if (verdict === "accepted" && match.status !== "finished") {
      match.status = "finished";

      match.winnerId = userId;

      const loserId =
        match.player1Id.toString() === userId.toString()
          ? match.player2Id
          : match.player1Id;

      match.loserId = loserId;
      match.endedAt = new Date();

      const updatedWinner = await User.findByIdAndUpdate(
        userId,
        { $inc: { wins: 1, currentStreak: 1 }, isInMatch: false },
        { new: true },
      );

      // Update bestStreak if current streak exceeded it
      if (updatedWinner.currentStreak > updatedWinner.bestStreak) {
        await User.findByIdAndUpdate(userId, {
          bestStreak: updatedWinner.currentStreak,
        });
      }

      // ── Loser: increment losses + reset streak ──
      await User.findByIdAndUpdate(loserId, {
        $inc: { losses: 1 },
        $set: { currentStreak: 0, isInMatch: false },
      });

      await User.findByIdAndUpdate(userId, {
        $inc: {
          wins: 1,
        },
        isInMatch: false,
      });

      await User.findByIdAndUpdate(loserId, {
        $inc: {
          losses: 1,
        },
        isInMatch: false,
      });

      io.to(`spectate:${match._id}`).emit("spectate:event", {
        type: "winner",
        message: `🏆 ${player.username} solved the problem`,
        timestamp: Date.now(),
      });

      if (match.matchType === "tournament" && match.tournamentId) {
        await advanceTournament(match.tournamentId, match);
      }
    }

    if (match.matchType === "ranked") {
      const winner = await User.findById(userId);
      const loserId =
        match.player1Id.toString() === userId.toString()
          ? match.player2Id
          : match.player1Id;
      const loser = await User.findById(loserId);

      match.player1EloBefore =
        match.player1Id.toString() === winner._id.toString()
          ? winner.elo
          : loser.elo;

      match.player2EloBefore =
        match.player2Id.toString() === winner._id.toString()
          ? winner.elo
          : loser.elo;

      const K = 32;
      const expectedWinner =
        1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
      const expectedLoser =
        1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
      winner.elo = Math.round(winner.elo + K * (1 - expectedWinner));
      loser.elo = Math.round(loser.elo + K * (0 - expectedLoser));

      await winner.save();
      await loser.save();

      match.player1EloAfter =
        match.player1Id.toString() === winner._id.toString()
          ? winner.elo
          : loser.elo;

      match.player2EloAfter =
        match.player2Id.toString() === winner._id.toString()
          ? winner.elo
          : loser.elo;

      await emitLeaderboardUpdate(io);
    }
    if (match.matchType === "tournament") {
      const winner = await User.findById(userId);

      const loserId =
        match.player1Id.toString() === userId.toString()
          ? match.player2Id
          : match.player1Id;

      const loser = await User.findById(loserId);

      winner.elo += 15;
      loser.elo = Math.max(800, loser.elo - 5);

      await winner.save();
      await loser.save();

      await emitLeaderboardUpdate(io);
    }

    await match.save();
    io.to(`spectate:${match._id}`).emit("spectate:progressUpdate", {
      player1Progress: match.player1Progress,
      player2Progress: match.player2Progress,
    });
    await emitHeroStats();

    if (match.status === "finished") {
      io.to(matchId).emit("matchFinished", {
        winnerId: match.winnerId,
        loserId: match.loserId,
        matchId,
      });

      const users = await User.find({
        isOnline: true,
      }).select("username elo wins losses solvedProblems isInMatch");

      io.emit("lobbyUpdated", users);
    }

    io.to(matchId).emit("progressUpdated", {
      player1Progress: match.player1Progress,
      player2Progress: match.player2Progress,
    });

    res.json({
      verdict,
      passed,
      total: problem.testCases.length,
      progress,
      winnerId: match.winnerId,
      status: match.status,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Submission failed",
    });
  }
};

export const getLobbyUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: {
        $ne: req.user._id,
      },

      isOnline: true,
    }).select("username elo wins losses solvedProblems isInMatch");

    const rankedUsers = users
      .map((user) => ({
        ...user.toObject(),

        solvedCount: user.solvedProblems.length,
      }))
      .sort((a, b) => b.solvedCount - a.solvedCount)
      .map((user, index) => ({
        ...user,

        leaderboardRank: index + 1,
      }));

    const currentUser = await User.findById(req.user._id).select("elo");

    res.json({
      currentUserElo: currentUser.elo,
      currentUserId: req.user._id,
      users: rankedUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const acceptMatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const match = await Match.findById(matchId);
    match.status = "active";
    match.startedAt = new Date();

    await match.save();
    await emitHeroStats();

    if (match.status === "finished" && match.tournamentId) {
      const updatedTournament = await Tournament.findById(match.tournamentId)
        .populate("participants", "username elo")
        .populate("winnerId", "username")
        .populate("bracket.matches.player1Id", "username elo")
        .populate("bracket.matches.player2Id", "username elo")
        .populate("bracket.matches.winnerId", "username");

      io.emit("tournament:update", updatedTournament);

      const currentRound =
        updatedTournament.bracket[updatedTournament.currentRound - 1];

      if (currentRound) {
        currentRound.matches.forEach((m) => {
          if (!m.winnerId && m.matchId && m.player1Id && m.player2Id) {
            const p1Socket = onlineUsers.get(m.player1Id._id.toString());

            const p2Socket = onlineUsers.get(m.player2Id._id.toString());

            if (p1Socket) {
              io.to(p1Socket).emit("tournamentMatchReady", {
                matchId: m.matchId,
                tournamentId: updatedTournament._id,
                tournamentName: updatedTournament.name,
                opponentName: m.player2Id.username,
              });
            }

            if (p2Socket) {
              io.to(p2Socket).emit("tournamentMatchReady", {
                matchId: m.matchId,
                tournamentId: updatedTournament._id,
                tournamentName: updatedTournament.name,
                opponentName: m.player1Id.username,
              });
            }
          }
        });
      }
    }

    const player1Socket = onlineUsers.get(match.player1Id.toString());

    const player2Socket = onlineUsers.get(match.player2Id.toString());

    if (player1Socket) {
      io.to(player1Socket).emit("matchAccepted", {
        matchId,
      });
    }

    if (player2Socket) {
      io.to(player2Socket).emit("matchAccepted", {
        matchId,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const getSpectateMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("player1Id", "username elo")
      .populate("player2Id", "username elo")
      .populate("problemId");

    if (!match) {
      return res.status(404).json({
        message: "Match not found",
      });
    }

    const userId = req.user?._id;

    const isParticipant =
      userId &&
      (match.player1Id._id.toString() === userId.toString() ||
        match.player2Id._id.toString() === userId.toString());

    if (isParticipant) {
      return res.status(403).json({
        message: "Players cannot spectate their own match",
      });
    }

    res.json(match);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getLiveMatches = async (req, res) => {
  const matches = await Match.find({
    status: "active",
  })
    .populate("player1Id", "username elo")
    .populate("player2Id", "username elo")
    .populate("problemId", "title difficulty");

  res.json(matches);
};

export const findMatch = async (req, res) => {
  try {
    const userId = req.user._id;

    const { matchType, difficulty } = req.body;

    const currentUser = await User.findById(userId);

    let opponent;

    if (matchType === "ranked") {
      opponent = await User.findOne({
        _id: { $ne: userId },
        isOnline: true,
        isInMatch: false,
        elo: {
          $gte: currentUser.elo - 200,
          $lte: currentUser.elo + 200,
        },
      }).sort({
        elo: 1,
      });
    } else {
      opponent = await User.findOne({
        _id: { $ne: userId },
        isOnline: true,
        isInMatch: false,
      });
    }

    if (!opponent) {
      return res.status(404).json({
        message: "No opponent available",
      });
    }

    const filter = {};

    if (difficulty !== "random") {
      filter.difficulty = difficulty;
    }

    const problems = await Problem.find(filter);

    if (!problems.length) {
      return res.status(404).json({
        message: "No problem found",
      });
    }

    const problem = problems[Math.floor(Math.random() * problems.length)];

    const match = await Match.create({
      player1Id: userId,
      player2Id: opponent._id,
      problemId: problem._id,
      matchType,
      difficulty: difficulty === "random" ? problem.difficulty : difficulty,
      status: "active",
      startedAt: new Date(),
    });

    await User.findByIdAndUpdate(userId, {
      isInMatch: true,
    });

    await User.findByIdAndUpdate(opponent._id, {
      isInMatch: true,
    });

    await emitHeroStats();

    const player1Socket = onlineUsers.get(userId.toString());

    const player2Socket = onlineUsers.get(opponent._id.toString());

    if (player1Socket) {
      io.to(player1Socket).emit("matchAccepted", {
        matchId: match._id,
      });
    }

    if (player2Socket) {
      io.to(player2Socket).emit("matchAccepted", {
        matchId: match._id,
      });
    }

    res.json({
      matchId: match._id,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};
