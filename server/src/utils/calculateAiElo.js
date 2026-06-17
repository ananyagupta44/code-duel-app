export const calculateAiElo = (playerElo, botElo, result) => {
  const K = 32;

  const expected = 1 / (1 + Math.pow(10, (botElo - playerElo) / 400));

  return Math.round(playerElo + K * (result - expected));
};
