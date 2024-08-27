import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import cx from "clsx";
import classes from "./dark-mode-toggle.module.css";

export function DarkModeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  // Actual computed value (takes auto into account)
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  return (
    <ActionIcon
      onClick={() =>
        setColorScheme(computedColorScheme === "light" ? "dark" : "light")
      }
      variant="default"
      size="lg"
      aria-label="Toggle color scheme"
    >
      {/* NOTE: Using CSS to switch between variants to avoid hydration errors,
      see https://mantine.dev/theming/color-schemes/.
      Since the correct value is read from localstorage server and client might
      not agree on the correct icon to display leading to hydration errors and
      rebuilding of the UI on the client. */}
      <IconMoon className={cx(classes.dark)} />
      <IconSun className={cx(classes.light)} />
    </ActionIcon>
  );
}
