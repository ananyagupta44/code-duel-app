import Match from "../models/Match.js";
import MatchSubmission from "../models/MatchSubmission.js";
import Problem from "../models/Problem.js";
import { onlineUsers } from "../socketStore.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { executeCode } from "../services/codeExecutor.js";
import {
  generateCppWrapper,
  generateJSWrapper,
  generatePythonWrapper,
} from "../services/wrapperGenerator.js";

export const createMatch = async (req, res) => {
  try {
    const { opponentId, matchType } = req.body;

    const player1Id = req.user._id;

    const problem = await Problem.aggregate([
      {
        $sample: {
          size: 1,
        },
      },
    ]);

    const match = await Match.create({
      player1Id,
      player2Id: opponentId,
      problemId: problem[0]._id,
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
    }

    if (match.matchType === "ranked") {
      const winner = await User.findById(userId);
      const loserId =
        match.player1Id.toString() === userId.toString()
          ? match.player2Id
          : match.player1Id;
      const loser = await User.findById(loserId);
      const K = 32;

      const expectedWinner =
        1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));

      const expectedLoser =
        1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));

      winner.elo = Math.round(winner.elo + K * (1 - expectedWinner));

      loser.elo = Math.round(loser.elo + K * (0 - expectedLoser));

      await winner.save();
      await loser.save();
    }

    await match.save();

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

    console.log("ACCEPT MATCH:", matchId);

    const match = await Match.findById(matchId);

    console.log("MATCH:", match);

    match.status = "active";
    match.startedAt = new Date();

    await match.save();

    const player1Socket = onlineUsers.get(
      match.player1Id.toString()
    );

    const player2Socket = onlineUsers.get(
      match.player2Id.toString()
    );

    console.log("PLAYER 1:", match.player1Id.toString());
    console.log("PLAYER 2:", match.player2Id.toString());

    console.log("SOCKET 1:", player1Socket);
    console.log("SOCKET 2:", player2Socket);

    if (player1Socket) {
      io.to(player1Socket).emit("matchAccepted", {
        matchId,
      });
      console.log("EMITTED TO PLAYER 1");
    }

    if (player2Socket) {
      io.to(player2Socket).emit("matchAccepted", {
        matchId,
      });
      console.log("EMITTED TO PLAYER 2");
    }

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};