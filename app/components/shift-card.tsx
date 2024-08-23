import {
  Badge,
  Center,
  Group,
  Paper,
  Progress,
  Text,
  rem,
  useMantineTheme,
} from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { marked } from "marked";

interface ShiftCardProps {
  shift: {
    description: string;
    location_name: string;
    title: string;
    start: string;
    end: string;
    needed_angel_types: {
      angel_type_name: string;
      count: number;
      needs: number;
      entries: { id: number; user_name: string }[];
    }[];
  };
}

// Inspiration: https://ui.mantine.dev/category/stats/#stats-card
//
// Information to display:
// * [x] time from
// * [x] time to
// * [x] title
// * [ ] shift type
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

  return (
    <Paper shadow="md" radius="md" withBorder p="lg">
      <Text ta="center" fw={800} mb={0}>
        {props.shift.title}
      </Text>
      <Text c="dimmed" ta="center" fz="sm">
        {format(parseISO(props.shift.start), "HH:mm")} –{" "}
        {format(parseISO(props.shift.end), "HH:mm")}
      </Text>
      <Center mt={10}>
        <Badge
          leftSection={
            <IconMapPin style={{ width: rem(12), height: rem(12) }} />
          }
        >
          {props.shift.location_name}
        </Badge>
      </Center>

      {props.shift.needed_angel_types.map((na) => (
        <>
          {/*
          <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: renderedDescription }} />
          </TypographyStylesProvider>*/}
          <Text c="dimmed" fz="sm" mt="md">
            {na.angel_type_name}:{" "}
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
                {e.user_name}
              </Badge>
            ))}
          </Group>
        </>
      ))}
    </Paper>
  );
}
