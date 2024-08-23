import {
  Badge,
  Center,
  Group,
  Paper,
  Progress,
  Text,
  rem,
} from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { marked } from "marked";
import { NavLink as NavLinkRemix } from "@remix-run/react";

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
  const renderedDescription =
    props.shift.description.length > 0
      ? marked.parse(props.shift.description, { async: false })
      : "";

  return (
    <Paper shadow="xl" radius="md" withBorder p="xl">
      <Center>
        <Badge
          leftSection={
            <IconMapPin style={{ width: rem(12), height: rem(12) }} />
          }
        >
          {props.shift.location_name}
        </Badge>
      </Center>
      <Group justify="center">
        <Text fw={800}>{props.shift.title}</Text>
      </Group>
      <Text c="dimmed" ta="center" fz="sm">
        {format(parseISO(props.shift.start), "HH:mm")} –{" "}
        {format(parseISO(props.shift.end), "HH:mm")}
      </Text>

      {props.shift.needed_angel_types.map((na) => (
        <>
          {/*
          <TypographyStylesProvider>
            <div dangerouslySetInnerHTML={{ __html: renderedDescription }} />
          </TypographyStylesProvider>*/}
          <Text c="dimmed" fz="sm" mt="md">
            {na.angel_type_name}:{" "}
            <Text span fw={500} c="bright">
              {na.count}/{na.needs}
            </Text>
          </Text>

          <Progress
            value={(na.count / na.needs) * 100}
            mt={5}
            color={na.count / na.needs >= 1 ? "green" : "yellow"}
          />
          {/* TODO: Make it clickable to filter by that user. */}
          <Group mt={6}>
            {na.entries.map((e) => (
              <Badge
                key={e.id}
                leftSection="🤹"
                color="green"
                component={NavLinkRemix}
                styles={{ root: { cursor: "pointer" } }}
                to="/users/foo"
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
