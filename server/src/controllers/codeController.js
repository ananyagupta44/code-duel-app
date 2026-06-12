import { executeCode } from "../services/codeExecutor.js";
import Problem from "../models/Problem.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { emitLeaderboardUpdate } from "../services/leaderboardEmitter.js";

import {
  generateCppWrapper,
  generateJSWrapper,
  generatePythonWrapper,
} from "../services/wrapperGenerator.js";

export const runCode = async (req, res) => {
  try {
    const { language, code, functionName, input } = req.body;

    let executableCode = code;

    if (language === "javascript") {
      executableCode = generateJSWrapper(code, functionName, input);
    }

    if (language === "python") {
      executableCode = generatePythonWrapper(code, functionName, input);
    }
    if (language === "cpp") {
      executableCode = generateCppWrapper(code, functionName, input);
    }

    const output = await executeCode(language, executableCode);

    res.json({
      output,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const submitCode = async (req, res) => {
  try {
    const { problemId } = req.params;

    const { language, code } = req.body;

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    let passed = 0;

    for (const testCase of problem.testCases) {
      let executableCode;

      if (language === "javascript") {
        executableCode = generateJSWrapper(
          code,
          problem.functionName,
          testCase.input,
        );
      }

      if (language === "python") {
        executableCode = generatePythonWrapper(
          code,
          problem.functionName,
          testCase.input,
        );
      }
      if (language === "cpp") {
        executableCode = generateCppWrapper(
          code,
          problem.functionName,
          testCase.input,
        );
      }

      const output = await executeCode(language, executableCode);
      const normalize = (str) =>
        str.replace(/\r\n/g, "\n").replace(/\s+/g, "").toLowerCase().trim();

      const normalizedOutput = normalize(output);
      const normalizedExpected = normalize(testCase.expectedOutput);

      if (normalizedOutput === normalizedExpected) {
        passed++;
      }
    }

    const verdict =
      passed === problem.testCases.length ? "Accepted" : "Wrong Answer";

    await Submission.create({
      user: req.user._id,
      problem: problemId,
      language,
      status: verdict,
      passedCases: passed,
      totalCases: problem.testCases.length,
    });

    if (verdict === "Accepted") {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
          solvedProblems: problem.slug,
        },
      });
      await emitLeaderboardUpdate(io);
    }
    res.json({
      verdict,
      passed,
      total: problem.testCases.length,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSolvedProblems = async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json(user.solvedProblems);
};
