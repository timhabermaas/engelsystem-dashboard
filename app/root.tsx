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
import { IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { DarkModeToggle } from "./components/dark-mode-toggle";

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
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  const revalidator = useRevalidator();

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        revalidator.revalidate();
      }, 30000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [autoRefresh]);

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
          <Title order={1} size="sm" visibleFrom="xs">
            25. Freiburger Jonglierfestival
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
