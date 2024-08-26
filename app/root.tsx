import "@mantine/core/styles.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  NavLink as NavLinkRemix,
  json,
} from "@remix-run/react";
import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  ColorSchemeScript,
  Group,
  MantineProvider,
  NavLink,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconExternalLink, IconMoon, IconSun } from "@tabler/icons-react";
import { useState } from "react";

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

export async function loader() {
  return json({
    ENV: {
      ENGELSYSTEM_URL: process.env.ENGELSYSTEM_URL,
    },
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  const [opened, setOpened] = useState<boolean>(false);
  const toggle = () => {
    setOpened((o) => !o);
  };
  const navClicked = () => {
    setOpened(false);
  };

  const { setColorScheme } = useMantineColorScheme();
  // Actual computed value (takes auto into account)
  const computedColorScheme = useComputedColorScheme("light");

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
            href={data.ENV.ENGELSYSTEM_URL}
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
