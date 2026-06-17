import Problem from "../models/Problem.js";

export const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select("title slug difficulty topic");

    res.json(problems);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({
        message: "Problem not found",
      });
    }

    res.json(problem);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProblemTopics = async (req, res) => {
  try {
    const topics = await Problem.distinct("topic");

    res.json(topics.sort());
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
