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

function hashCode(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
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

export function colorForName(
  name: string,
  colors: MantineColor[] = extendedDefaultColors
) {
  const hash = hashCode(name);
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
