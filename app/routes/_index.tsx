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
} from "@mantine/core";
import { json, type MetaFunction } from "@remix-run/node";
import { useLoaderData, NavLink as NavLinkRemix } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/db/connection";
import { groupBy } from "~/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export async function loader() {
  const shifts = await db
    .selectFrom("shifts")
    .leftJoin("shift_entries", "shift_entries.shift_id", "shifts.id")
    .leftJoin("users", "shift_entries.user_id", "users.id")
    .leftJoin("angel_types", "shift_entries.angel_type_id", "angel_types.id")
    .select([
      "shifts.id",
      "shifts.title",
      "shifts.start",
      "shifts.end",
      "users.name",
      "angel_types.name",
    ])
    .orderBy("shifts.start")
    .execute();

  const shift_entries = await db
    .selectFrom("shift_entries")
    .innerJoin("users", "shift_entries.user_id", "users.id")
    .innerJoin("angel_types", "angel_type_id", "angel_types.id")
    .select([
      "users.name as nickname",
      "angel_types.name as angel_type",
      "shift_id",
    ])
    .execute();

  const shift_entries_by_id = groupBy(shift_entries, (se) => se.shift_id);

  const users = await db.selectFrom("users").select(["id", "name"]).execute();

  return json({ users, shifts, shift_entries, shift_entries_by_id });
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
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
        <pre>{JSON.stringify(data.shifts, null, 2)}</pre>
        <pre>{JSON.stringify(data.shift_entries, null, 2)}</pre>
        <pre>{JSON.stringify(data.shift_entries_by_id, null, 2)}</pre>
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
      </AppShell.Main>
    </AppShell>
  );
}
