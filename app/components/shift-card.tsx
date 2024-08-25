import {
  Badge,
  Center,
  Group,
  NumberFormatter,
  Paper,
  Progress,
  Stack,
  Text,
  rem,
} from "@mantine/core";
import {
  IconChisel,
  IconClock,
  IconMapPin,
  IconStopwatch,
} from "@tabler/icons-react";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { marked } from "marked";
import { colorForId } from "~/utils";
import classes from "~/components/shift-card.module.css";

interface ShiftCardProps {
  shift: {
    description: string;
    locationName: string;
    title: string;
    start: string;
    end: string;
    shiftTypeId: number;
    shiftTypeName: string;
    neededAngelTypes: {
      angelTypeName: string;
      count: number;
      needs: number;
      entries: { id: number; userName: string }[];
    }[];
  };
}

// Inspiration: https://ui.mantine.dev/category/stats/#stats-card
//
// Information to display:
// * [x] time from
// * [x] time to
// * [x] title
// * [x] shift type
// * [x] location
// * [x] per angel type:
//   * [x] needs
//   * [x] has
//   * [x] list of user names
export function ShiftCard(props: ShiftCardProps) {
  // TODO: Display description in an overlay after touch.
  const renderedDescription =
    props.shift.description.length > 0
      ? marked.parse(props.shift.description, { async: false })
      : "";

  const start = parseISO(props.shift.start);
  const end = parseISO(props.shift.end);
  const durationInMin = differenceInMinutes(end, start);

  return (
    <Paper shadow="sm" radius="md" withBorder p="lg" py="lg">
      <Stack justify="space-between" h="100%">
        <div>
          <Center mb={10}>
            <Badge
              size="md"
              color={colorForId(props.shift.shiftTypeId)}
              variant="light"
            >
              {props.shift.shiftTypeName}{" "}
            </Badge>
          </Center>
          <Text ta="center" fw={800} mb={-1}>
            {props.shift.title}
          </Text>
          <Center mb={20}>
            <IconClock className={classes.icon} size="1.25rem" stroke={2} />
            <Text size="sm">
              {/* TODO: Make sure we use the same locale on both client side
              and backend side, otherwise this will cause hydration to fail.
              */}
              {format(start, "HH:mm")} – {format(end, "HH:mm")}
            </Text>
          </Center>

          <Stack gap={10}>
            {props.shift.neededAngelTypes.map((na) => (
              <div>
                <Text c="dimmed" fz="sm">
                  {na.angelTypeName}:{" "}
                  <Text span c="bright">
                    {na.count}/{na.needs}
                  </Text>
                </Text>

                <Progress
                  value={(na.count / na.needs) * 100}
                  mt={2}
                  color={na.count / na.needs >= 1 ? "green" : "orange"}
                />
                <Group mt={8} gap={4}>
                  {na.entries.map((e) => (
                    <Badge
                      tt="none"
                      variant="light"
                      key={e.id}
                      leftSection="🤹"
                      color="blue.5"
                    >
                      {e.userName}
                    </Badge>
                  ))}
                </Group>
              </div>
            ))}
          </Stack>
        </div>

        <Group gap={8} mt={15}>
          <Center>
            <IconMapPin className={classes.icon} size="1.05rem" stroke={1.5} />
            <Text size="xs">{props.shift.locationName}</Text>
          </Center>
          <Center>
            <IconStopwatch
              className={classes.icon}
              size="1.05rem"
              stroke={1.5}
            />
            <Text size="xs">
              <NumberFormatter
                value={durationInMin / 60}
                decimalScale={2}
                suffix="h"
              />
            </Text>
          </Center>
        </Group>
      </Stack>
    </Paper>
  );
}
