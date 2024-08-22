import {
  AppShell,
  Burger,
  Combobox,
  Group,
  Highlight,
  NavLink,
  TextInput,
  Title,
  useCombobox,
  Image,
  Text,
  Badge,
  Button,
  Paper,
  Progress,
  ThemeIcon,
  rem,
  Center,
  TypographyStylesProvider,
  Affix,
  Transition,
  Stack,
  SegmentedControl,
} from "@mantine/core";
import { marked } from "marked";
import { json, SerializeFrom, type MetaFunction } from "@remix-run/node";
import { useLoaderData, NavLink as NavLinkRemix } from "@remix-run/react";
import { IconArrowUp, IconMapPin, IconSwimming } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { NotNull } from "kysely";
import { useState } from "react";
import { db } from "~/db/connection";
import { groupBy } from "~/utils";
import { useScrollIntoView, useWindowScroll } from "@mantine/hooks";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
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
    .leftJoin(
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

  const users = await db.selectFrom("users").select(["id", "name"]).execute();

  return json({
    users,
    shifts,
    shift_entries,
    needed_angel_types_by_id,
    shift_entries_by_id,
    combined_shifts,
  });
}

type LoaderType = SerializeFrom<typeof loader>;

interface ShiftCardProps {
  shift: LoaderType["combined_shifts"][number];
}

// TODO:
// * Header with fullscreen button (useFullscreen)
// * Scroll to days by using a combination of Affix and FloatingIndicator

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
function ShiftCard(props: ShiftCardProps) {
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

export default function Index() {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    offset: 60,
  });
  const data = useLoaderData<typeof loader>();
  const shiftsByDate = groupBy(data.combined_shifts, (s) =>
    format(parseISO(s.start), "yyyy-MM-dd")
  );
  console.log(shiftsByDate);
  const users = data.users;
  const [opened, setOpened] = useState<boolean>(false);
  const [value, setValue] = useState("");

  const toggle = () => {
    setOpened((o) => !o);
  };

  const combobox = useCombobox();

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(value.toLowerCase().trim())
  );

  const selectedUser = users.find((u) => u.name === value);

  const options = filteredUsers.map((user) => (
    <Combobox.Option value={user.name} key={user.id}>
      <Highlight highlight={value}>{user.name}</Highlight>
    </Combobox.Option>
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          Some Logo
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Title order={2}>Navigation</Title>
        <NavLink
          href="/"
          label="some navigation"
          renderRoot={(props) => <NavLinkRemix to={props.href} {...props} />}
        />
        <NavLink
          href="/foo"
          label="some other navigation"
          renderRoot={(props) => <NavLinkRemix to={props.href} {...props} />}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Title order={1}>Hello {selectedUser?.name}!</Title>
        <Combobox
          onOptionSubmit={(optionValue) => {
            setValue(optionValue);
            combobox.closeDropdown();
          }}
          withinPortal={false}
          store={combobox}
        >
          <Combobox.Target>
            <TextInput
              label="Nickname"
              value={value}
              onChange={(event) => {
                setValue(event.currentTarget.value);
                combobox.openDropdown();
              }}
              onClick={() => combobox.openDropdown()}
              onFocus={() => combobox.openDropdown()}
              onBlur={() => combobox.closeDropdown()}
            />
          </Combobox.Target>
          <Combobox.Dropdown>
            <Combobox.Options>
              {options.length === 0 ? (
                <Combobox.Empty>Nothing found</Combobox.Empty>
              ) : (
                options
              )}
            </Combobox.Options>
          </Combobox.Dropdown>
        </Combobox>

        {Object.entries(shiftsByDate).map(([d, shifts]) => (
          /* TODO: Move this into its own component and use targetRef inside */
          <>
            <Title ta="center" mb={20} ref={targetRef}>
              {format(parseISO(d), "eeee, do MMMM")}
            </Title>
            <Stack mb={30}>
              {shifts.map((s) => (
                <ShiftCard shift={s} key={s.id} />
              ))}
            </Stack>
          </>
        ))}
      </AppShell.Main>
      <Affix
        position={{ bottom: 20, left: "50%" }}
        style={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <SegmentedControl
          data={Object.keys(shiftsByDate)}
          onChange={(v) => {
            scrollIntoView();
          }}
        ></SegmentedControl>
      </Affix>
    </AppShell>
  );
}
