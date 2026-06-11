import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import Problem from "./models/Problem.js";
import problems from "./data/problems.js";

dotenv.config();

await connectDB();

try {
  await Problem.deleteMany();

  await Problem.insertMany(problems);

  console.log("Problems Seeded");

  process.exit();
} catch (error) {
  console.error(error);

  process.exit(1);
}
