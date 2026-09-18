export const generateMemberCode = (id: number): string => {
  const part1 = String(Math.floor(id / 10000)).padStart(4, "0");
  const part2 = String(id % 10000).padStart(4, "0");

  return `AIPGE-${part1}-${part2}`;
};