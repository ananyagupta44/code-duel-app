import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import { io } from "../server.js";
import { onlineUsers } from "../socketStore.js";

export const advanceTournament = async (tournamentId, finishedMatch) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) return;

  const roundIndex = tournament.currentRound - 1;

  const round = tournament.bracket[roundIndex];

  const bracketMatch = round.matches.find(
    (m) => m.matchId.toString() === finishedMatch._id.toString(),
  );

  if (!bracketMatch) return;

  bracketMatch.winnerId = finishedMatch.winnerId;

  await tournament.save();

  const roundFinished = round.matches.every((m) => m.winnerId);

  if (!roundFinished) return;

  const winners = round.matches.map((m) => m.winnerId);

  if (winners.length === 1) {
    tournament.status = "finished";

    tournament.winnerId = winners[0];
    const champion = await User.findById(winners[0]);

    const championEloBefore = champion.elo;

    champion.elo += 100;

    await champion.save();

    await Match.findByIdAndUpdate(finishedMatch._id, {
      player1EloBefore:
        finishedMatch.player1Id.toString() === champion._id.toString()
          ? championEloBefore
          : finishedMatch.player1EloBefore,

      player2EloBefore:
        finishedMatch.player2Id.toString() === champion._id.toString()
          ? championEloBefore
          : finishedMatch.player2EloBefore,

      player1EloAfter:
        finishedMatch.player1Id.toString() === champion._id.toString()
          ? champion.elo
          : finishedMatch.player1EloAfter,

      player2EloAfter:
        finishedMatch.player2Id.toString() === champion._id.toString()
          ? champion.elo
          : finishedMatch.player2EloAfter,
    });

    await tournament.save();

    return;
  }

  const nextRoundNumber = tournament.currentRound + 1;

  const nextRoundMatches = [];

  const problems = await Problem.find();

  for (let i = 0; i < winners.length; i += 2) {
    const problem = problems[Math.floor(Math.random() * problems.length)];

    const match = await Match.create({
      player1Id: winners[i],
      player2Id: winners[i + 1],
      tournamentId: tournament._id,
      problemId: problem._id,
      difficulty: problem.difficulty,
      matchType: "tournament",
      status: "waiting",
      startTime: new Date(Date.now() + 5 * 60 * 1000),
      durationSecs: 1800,
    });

    tournament.matchIds.push(match._id);

    nextRoundMatches.push({
      matchId: match._id,

      player1Id: winners[i],

      player2Id: winners[i + 1],

      winnerId: null,
    });
  }

  tournament.bracket.push({
    round: nextRoundNumber,
    matches: nextRoundMatches,
  });

  tournament.currentRound = nextRoundNumber;

  await tournament.save();
};

export const startTournamentInternal = async (tournamentId) => {
  console.log("START TOURNAMENT CALLED");

  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) {
    throw new Error("Tournament not found");
  }

  if (tournament.status !== "upcoming") {
    throw new Error("Tournament already started");
  }

  if (tournament.participants.length < 2) {
    tournament.status = "cancelled";

    await tournament.save();

    return tournament;
  }

  const players = await User.find({
    _id: { $in: tournament.participants },
  }).sort({ elo: -1 });

  const count = players.length;

  if ((count & (count - 1)) !== 0) {
    throw new Error(
      "Tournament participants must be a power of 2 (4,8,16,32...)",
    );
  }

  let problems;

  if (tournament.difficulty === "mixed") {
    problems = await Problem.find();
  } else {
    problems = await Problem.find({
      difficulty: tournament.difficulty,
    });
  }

  if (!problems.length) {
    throw new Error("No problems found");
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

      // waiting until scheduler activates it
      status: "waiting",

      startTime: new Date(Date.now() + 5 * 60 * 1000),

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

  // tournament starts immediately
  tournament.status = "active";

  await tournament.save();

  return tournament;
};
