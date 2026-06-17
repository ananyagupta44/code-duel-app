import Match from "../models/Match.js";
import { AI_BOTS } from "../utils/aiBots.js";
import { io } from "../server.js";

export const startAiMatch = (match) => {
  const bot = AI_BOTS[match.aiBot.id];

  if (!bot) return;

  let progress = 0;

  const interval = setInterval(async () => {
    const increment =
      Math.floor(
        Math.random() *
          (bot.maxIncrement - bot.minIncrement + 1)
      ) + bot.minIncrement;

    progress += increment;

    if (progress > 100) {
      progress = 100;
    }

    await Match.findByIdAndUpdate(match._id, {
      player2Progress: progress,
    });

    io.to(match._id.toString()).emit(
      "progressUpdated",
      {
        matchId: match._id,
        player2Progress: progress,
      }
    );

    if (progress >= 100) {
      clearInterval(interval);

      await Match.findByIdAndUpdate(match._id, {
        aiFinishTime: Date.now(),
      });
    }
  }, 7000);
};