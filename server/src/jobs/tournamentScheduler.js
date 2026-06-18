import cron from "node-cron";
import Tournament from "../models/Tournament.js";
import { startTournamentInternal } from "../services/tournamentEngine.js";

export const startTournamentScheduler = () => {
  cron.schedule("*/10 * * * * *", async () => {
    try {
      const now = new Date();

      const tournaments = await Tournament.find({
        status: "upcoming",
        startDate: { $lte: now },
      });

      for (const tournament of tournaments) {
        console.log(`Auto-starting tournament: ${tournament.name}`);

        await startTournamentInternal(tournament._id);
      }
    } catch (err) {
      console.log(err);
    }
  });
};
