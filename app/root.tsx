import "@mantine/core/styles.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink as NavLinkRemix,
  useRevalidator,
} from "@remix-run/react";
import {
  ActionIcon,
  Text,
  AppShell,
  Burger,
  ColorSchemeScript,
  Group,
  MantineProvider,
  NavLink,
  rem,
  Switch,
  Title,
} from "@mantine/core";
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { DarkModeToggle } from "./components/dark-mode-toggle";
import { useFullscreen } from "@mantine/hooks";
import { useEventSource } from "remix-utils/sse/react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">{children}</MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const { toggle: toggleFullscreen, fullscreen } = useFullscreen();

  const sequenceNumber: string | null = useEventSource("/sse/update", {
    event: "update",
  });

  const revalidator = useRevalidator();

  useEffect(() => {
    // sequenceNumber === null indicates the first render before we got any
    // event from the backend. We don't need to refresh in this case.
    if (sequenceNumber !== null) {
      revalidator.revalidate();
    }
  }, [sequenceNumber]);

  const [opened, setOpened] = useState<boolean>(false);
  const toggle = () => {
    setOpened((o) => !o);
  };
  const navClicked = () => {
    setOpened(false);
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
          <Title order={1} size="sm" visibleFrom="sm" fw={800}>
            25. Freiburger Jonglierfestival
          </Title>

          <Text visibleFrom="sm">/</Text>

          <Title order={2} size="sm" fw={400} visibleFrom="xs">
            Shifts
          </Title>
          <Switch
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.currentTarget.checked)}
            size="xl"
            onLabel="ON"
            offLabel="OFF"
            thumbIcon={
              <IconRefresh
                color="gray"
                style={{ width: rem(14), height: rem(14) }}
              />
            }
            ml="auto"
          />
          <DarkModeToggle />
          <ActionIcon
            variant="default"
            size="lg"
            onClick={() => {
              toggleFullscreen();
            }}
          >
            {!fullscreen && <IconArrowsMaximize />}
            {fullscreen && <IconArrowsMinimize />}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Title order={3}>Navigation</Title>
        <NavLink
          href="/"
          label="Shifts"
          renderRoot={(props) => <NavLinkRemix to={props.href} {...props} />}
          onClick={() => navClicked()}
        />
        <NavLink
          href="/stats"
          label="Stats"
          renderRoot={(props) => <NavLinkRemix to={props.href} {...props} />}
          onClick={() => navClicked()}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
