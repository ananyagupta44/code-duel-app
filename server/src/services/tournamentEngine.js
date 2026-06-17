import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";

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
    await User.findByIdAndUpdate(winners[0], {
      $inc: {
        tournamentWins: 1,
      },
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
