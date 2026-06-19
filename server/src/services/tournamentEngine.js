import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";
import { io } from "../server.js";
import { onlineUsers } from "../socketStore.js";

export const advanceTournament = async (tournamentId, finishedMatch = null) => {
  const tournament = await Tournament.findById(tournamentId);

  if (!tournament) return;

  const roundIndex = tournament.currentRound - 1;
  const round = tournament.bracket[roundIndex];

  if (!round) return;

  // Update winner for a real match
  if (finishedMatch) {
    const bracketMatch = round.matches.find(
      (m) => m.matchId && m.matchId.toString() === finishedMatch._id.toString(),
    );

    if (!bracketMatch) return;

    bracketMatch.winnerId = finishedMatch.winnerId;

    await tournament.save();
  }

  // Round not complete yet
  const roundFinished = round.matches.every((m) => m.winnerId);

  if (!roundFinished) return;

  const winners = round.matches.map((m) => m.winnerId);

  // =====================================
  // TOURNAMENT FINISHED
  // =====================================
  if (winners.length === 1) {
    tournament.status = "finished";
    tournament.winnerId = winners[0];

    const champion = await User.findById(winners[0]);

    if (champion) {
      const championEloBefore = champion.elo;

      // Champion reward
      champion.elo += 100;

      // Ensure badge array exists
      if (!champion.tournamentBadges) {
        champion.tournamentBadges = [];
      }

      // Prevent duplicate badges
      const alreadyHasBadge = champion.tournamentBadges.some(
        (b) => b.tournamentId?.toString() === tournament._id.toString(),
      );

      if (!alreadyHasBadge) {
        champion.tournamentBadges.push({
          tournamentId: tournament._id,
          tournamentName: tournament.name,
          difficulty: tournament.difficulty,
          wonAt: new Date(),
        });
      }

      console.log(`🏆 ${champion.username} won ${tournament.name}`);

      await champion.save();

      // Update final match ELO snapshot
      if (finishedMatch) {
        await Match.findByIdAndUpdate(finishedMatch._id, {
          player1EloBefore:
            finishedMatch.player1Id?.toString() === champion._id.toString()
              ? championEloBefore
              : finishedMatch.player1EloBefore,

          player2EloBefore:
            finishedMatch.player2Id?.toString() === champion._id.toString()
              ? championEloBefore
              : finishedMatch.player2EloBefore,

          player1EloAfter:
            finishedMatch.player1Id?.toString() === champion._id.toString()
              ? champion.elo
              : finishedMatch.player1EloAfter,

          player2EloAfter:
            finishedMatch.player2Id?.toString() === champion._id.toString()
              ? champion.elo
              : finishedMatch.player2EloAfter,
        });
      }
    }

    await tournament.save();

    return tournament;
  }

  // =====================================
  // BUILD NEXT ROUND
  // =====================================
  const nextRoundNumber = tournament.currentRound + 1;

  const problems =
    tournament.difficulty === "mixed"
      ? await Problem.find()
      : await Problem.find({
          difficulty: tournament.difficulty,
        });

  if (!problems.length) {
    throw new Error("No problems found");
  }

  const nextRoundMatches = [];

  for (let i = 0; i < winners.length; i += 2) {
    const player1 = winners[i];
    const player2 = winners[i + 1];

    // BYE in next round
    if (!player2) {
      nextRoundMatches.push({
        matchId: null,
        player1Id: player1,
        player2Id: null,
        winnerId: player1,
        isBye: true,
      });

      continue;
    }

    const problem = problems[Math.floor(Math.random() * problems.length)];

    const match = await Match.create({
      player1Id: player1,
      player2Id: player2,
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
      player1Id: player1,
      player2Id: player2,
      winnerId: null,
    });
  }

  tournament.bracket.push({
    round: nextRoundNumber,
    matches: nextRoundMatches,
  });

  tournament.currentRound = nextRoundNumber;

  await tournament.save();

  // =====================================
  // AUTO-ADVANCE ROUNDS CONTAINING
  // ONLY BYES
  // =====================================
  const allDecided = nextRoundMatches.every((m) => m.winnerId);

  if (allDecided) {
    return advanceTournament(tournament._id, null);
  }

  return tournament;
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

  const bracketSize = Math.pow(2, Math.ceil(Math.log2(count)));

  const byes = bracketSize - count;

  const seededPlayers = [...players];

  for (let i = 0; i < byes; i++) {
    seededPlayers.push(null);
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

  for (let i = 0; i < bracketSize / 2; i++) {
    const player1 = seededPlayers[i];
    const player2 = seededPlayers[bracketSize - 1 - i];

    const problem = problems[Math.floor(Math.random() * problems.length)];

    if (!player1 || !player2) {
      const winner = player1 || player2;

      bracketMatches.push({
        matchId: null,
        player1Id: player1?._id || null,
        player2Id: player2?._id || null,
        winnerId: winner?._id || null,
        isBye: true,
      });

      continue;
    }

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
  tournament.totalRounds = Math.log2(bracketSize);

  // tournament starts immediately
  tournament.status = "active";

  await tournament.save();

  return tournament;
};
