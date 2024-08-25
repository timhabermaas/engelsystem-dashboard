import { MantineColor } from "@mantine/core";

export function groupBy<T, K extends keyof any>(
  list: T[],
  getKey: (item: T) => K
) {
  return list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) previous[group] = [];
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);
}

// Using pseudo random to be able to fix seed, otherwise rerenders might change color mapping.
function pseudoRandom(seed: number): [number, number] {
  var x = Math.sin(seed++) * 10000;
  return [x - Math.floor(x), seed];
}

function shuffleArray<T>(array: T[]) {
  let seed = 1;

  for (let i = array.length - 1; i > 0; i--) {
    const [random, newSeed] = pseudoRandom(seed);
    seed = newSeed;
    const j = Math.floor(random * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const defaultColors: MantineColor[] = [
  "blue",
  "cyan",
  "grape",
  "green",
  "indigo",
  "lime",
  "orange",
  "pink",
  "red",
  "teal",
  "violet",
];

const extendedDefaultColors = defaultColors.flatMap((c) => [
  `${c}.3`,
  `${c}.6`,
  `${c}.9`,
]);
shuffleArray(extendedDefaultColors);

export function colorForId(
  id: number,
  colors: MantineColor[] = extendedDefaultColors
) {
  const index = id % colors.length;
  return colors[index];
}
