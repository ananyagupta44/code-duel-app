const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  cpp: 54,
};

const b64encode = (str) => Buffer.from(str).toString("base64");
const b64decode = (str) =>
  str ? Buffer.from(str, "base64").toString("utf8") : "";

export const executeCode = async (language, code, input = "") => {
  const language_id = LANGUAGE_MAP[language];

  if (!language_id) return "Language not supported";

  // Submit with base64 encoding
  const submitRes = await fetch(
    `${JUDGE0_URL}/submissions?base64_encoded=true&wait=false`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: b64encode(code),
        language_id,
        stdin: b64encode(input),
      }),
    },
  );
  const { token } = await submitRes.json();

  // Poll with base64 encoding
  let result;
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 800));
    const pollRes = await fetch(
      `${JUDGE0_URL}/submissions/${token}?base64_encoded=true&fields=stdout,stderr,status,time,compile_output`,
    );
    result = await pollRes.json();
    if (result.status?.id > 2) break;
  }

  if (result.compile_output) return b64decode(result.compile_output);
  if (result.stderr) return b64decode(result.stderr);
  if (result.status?.description === "Time Limit Exceeded")
    return "Time Limit Exceeded";

  return b64decode(result.stdout) || "No Output";
};
