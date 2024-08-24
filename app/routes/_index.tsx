import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Title,
  SimpleGrid,
  Space,
  useComputedColorScheme,
  useMantineColorScheme,
  ActionIcon,
  Chip,
  Button,
  Fieldset,
  Text,
  Stack,
} from "@mantine/core";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData, NavLink as NavLinkRemix } from "@remix-run/react";
import { format, parseISO } from "date-fns";
import { NotNull } from "kysely";
import { useState } from "react";
import { db } from "~/db/connection";
import { colorForName, groupBy } from "~/utils";
import { ShiftCard } from "~/components/shift-card";
import { SearchableMultiSelect } from "~/components/searchable-multi-select";
import { IconExternalLink, IconMoon, IconSun } from "@tabler/icons-react";
import { useSet } from "@mantine/hooks";
import { ShiftTypeFilter } from "~/components/shift-type-filter";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard Engelsystem" },
    {
      name: "description",
      content: "Read-only dashboard displaying all shifts",
    },
  ];
};

export async function loader() {
  const shifts = await db
    .selectFrom("shifts")
    .innerJoin("locations", "locations.id", "shifts.location_id")
    .innerJoin("shift_types", "shift_types.id", "shifts.shift_type_id")
    .select([
      "shifts.id",
      "shifts.title",
      "shifts.start",
      "shifts.end",
      "shifts.description",
      "shifts.created_at",
      "shifts.updated_at",
      "locations.id as location_id",
      "locations.name as location_name",
      "shift_types.id as shift_type_id",
      "shift_types.name as shift_type_name",
    ])
    .orderBy("shifts.start")
    .execute();

  const shift_entries = await db
    .selectFrom("shift_entries")
    .innerJoin("users", "shift_entries.user_id", "users.id")
    .innerJoin("angel_types", "angel_type_id", "angel_types.id")
    .select([
      "shift_entries.id",
      "users.id as user_id",
      "users.name as user_name",
      "angel_types.id as angel_type_id",
      "shift_id",
    ])
    .execute();

  //const angel_types_by_id = groupBy(angel_types, (at) => at.id);

  const needed_angel_types = await db
    .selectFrom("needed_angel_types")
    .innerJoin(
      "angel_types",
      "angel_types.id",
      "needed_angel_types.angel_type_id"
    )
    .select([
      "shift_id",
      "angel_type_id as id",
      "count as needs",
      "angel_types.name as angel_type_name",
    ])
    .where("shift_id", "is not", null)
    .where("angel_type_id", "is not", null)
    .$narrowType<{ shift_id: NotNull }>()
    .$narrowType<{ id: NotNull }>()
    .execute();

  const needed_angel_types_by_id = groupBy(
    needed_angel_types,
    (na) => na.shift_id
  );

  const shift_entries_by_id = groupBy(
    shift_entries,
    (se) => `${se.shift_id}-${se.angel_type_id}`
  );

  const combined_shifts = shifts.map((s) => ({
    ...s,
    needed_angel_types: needed_angel_types_by_id[s.id].map((na) => {
      const entries = shift_entries_by_id[`${s.id}-${na.id}`] ?? [];
      return {
        ...na,
        entries,
        count: entries.length,
      };
    }),
  }));

  const users = await db
    .selectFrom("users")
    .select(["id", "name"])
    .orderBy("name")
    .execute();

  const shift_types = await db
    .selectFrom("shift_types")
    .select(["id", "name", "description"])
    .orderBy("name")
    .execute();

  return json({
    users,
    shifts,
    shift_entries,
    needed_angel_types_by_id,
    shift_entries_by_id,
    combined_shifts,
    shift_types,
    engelsystem_url: process.env.ENGELSYSTEM_URL,
  });
}

// TODO:
// * Header with fullscreen button (useFullscreen)
// * Slider with from+to to limit date + time. eachHourOfInterval can be used to get a list of hours for the slider values.

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const [opened, setOpened] = useState<boolean>(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const selectedShiftTypes = useSet<number>(
    data.shift_types.map((st) => st.id)
  );

  const { setColorScheme } = useMantineColorScheme();
  // Actual computed value (takes auto into account)
  const computedColorScheme = useComputedColorScheme("light");

  let combined_shifts = data.combined_shifts;

  if (selectedUserIds.length > 0) {
    combined_shifts = combined_shifts.filter((s) =>
      s.needed_angel_types.some((at) =>
        at.entries.some((e) => selectedUserIds.includes(e.user_id))
      )
    );
  }

  combined_shifts = combined_shifts.filter((s) =>
    selectedShiftTypes.has(s.shift_type_id)
  );

  const shiftsByDate = groupBy(combined_shifts, (s) =>
    format(parseISO(s.start), "yyyy-MM-dd")
  );

  const toggle = () => {
    setOpened((o) => !o);
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "xl",
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" align="center">
          <Burger opened={opened} onClick={toggle} />
          <Title order={1} size="sm" visibleFrom="xs">
            25. Freiburger Jonglierfestival
          </Title>
          <Button
            component="a"
            href={data.engelsystem_url}
            target="_blank"
            ml="auto"
            variant="default"
            size="sm"
            leftSection={<IconExternalLink />}
          >
            Sign up for shift
          </Button>
          <ActionIcon
            onClick={() =>
              setColorScheme(computedColorScheme === "light" ? "dark" : "light")
            }
            variant="default"
            size="lg"
            aria-label="Toggle color scheme"
          >
            {computedColorScheme === "light" ? <IconMoon /> : <IconSun />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Title order={3}>Navigation</Title>
        <NavLink
          href="/"
          label="Overview"
          renderRoot={(props) => <NavLinkRemix to={props.href} {...props} />}
        />
        <NavLink
          href="/users"
          label="Angels"
          renderRoot={(props) => <NavLinkRemix to={props.href} {...props} />}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Title ta="center" mb={20} order={1}>
          Shift Overview
        </Title>
        <SimpleGrid cols={{ sm: 2 }} mb={"xl"} spacing="xl">
          <Stack gap="xs">
            <Text component="label" size="sm" fw={500}>
              Angels
            </Text>
            <SearchableMultiSelect
              options={data.users.map(({ id, name }) => [id.toString(), name])}
              onChangeOptions={(values) => {
                setSelectedUserIds(values.map((i) => parseInt(i)));
              }}
            />
          </Stack>
          <Stack>
            <Text component="label" size="sm" fw={500}>
              Shift Type
            </Text>
            <ShiftTypeFilter
              shiftTypes={data.shift_types}
              selected={selectedShiftTypes}
              onChange={(id, checked) => {
                if (checked) {
                  selectedShiftTypes.add(id);
                } else {
                  selectedShiftTypes.delete(id);
                }
              }}
            />
          </Stack>
        </SimpleGrid>

        {Object.entries(shiftsByDate).map(([d, shifts]) => (
          /* TODO: Move this into its own component and use targetRef inside */
          <>
            <Title ta="center" mb={20} order={2}>
              {format(parseISO(d), "eeee, do MMMM")}
            </Title>
            <SimpleGrid mb={40} cols={{ lg: 4, md: 3, sm: 2, xs: 1 }}>
              {shifts.map((s) => (
                <ShiftCard shift={s} key={s.id} />
              ))}
            </SimpleGrid>
          </>
        ))}
      </AppShell.Main>
    </AppShell>
  );
}
