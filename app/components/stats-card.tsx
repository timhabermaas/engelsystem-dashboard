import {
  Center,
  DefaultMantineColor,
  Group,
  Paper,
  rem,
  RingProgress,
  Text,
} from "@mantine/core";
import { IconStopwatch } from "@tabler/icons-react";

interface StatsCardProps {
  label: string;
  color: DefaultMantineColor;
  progress: number;
  stats: JSX.Element | string;
}

export function StatsCard(props: StatsCardProps) {
  return (
    <Paper withBorder radius="md" p="xs">
      <Group>
        <RingProgress
          size={80}
          roundCaps
          thickness={8}
          sections={[{ value: props.progress, color: props.color }]}
          label={
            <Center>
              <IconStopwatch
                style={{ width: rem(20), height: rem(20) }}
                stroke={1.5}
              />
            </Center>
          }
        />

        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {props.label}
          </Text>
          <Text fw={700} size="xl">
            {props.stats}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}
