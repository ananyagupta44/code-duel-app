const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

export const executeCode = async (source_code, language_id, stdin = "") => {
  const submitRes = await fetch(`${JUDGE0_URL}/submissions?wait=false`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source_code, language_id, stdin }),
  });
  const { token } = await submitRes.json();

  let result;
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 800));
    const pollRes = await fetch(
      `${JUDGE0_URL}/submissions/${token}?fields=stdout,stderr,status,time,memory,compile_output`,
    );
    result = await pollRes.json();
    if (result.status?.id > 2) break;
  }

  return result;
};
