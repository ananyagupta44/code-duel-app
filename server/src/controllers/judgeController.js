import { executeCode } from "../services/judgeService.js";

export const runCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin } = req.body;
    const result = await executeCode(source_code, language_id, stdin);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Execution failed" });
  }
};
