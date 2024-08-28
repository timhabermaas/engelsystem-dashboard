import { MantineSize, Switch } from "@mantine/core";
import { useFilterParams } from "~/hooks/use-filter-params";

interface FutureSwitchProps {
  size?: MantineSize;
}

export function FutureSwitch(props: FutureSwitchProps) {
  const [filterParams, setFilterParams] = useFilterParams();

  // TODO: Make it optimistic UI update. It currently waits for a server
  // roundtrip until the switch is flipped.

  return (
    <Switch
      label="Present shifts only"
      checked={filterParams.ongoing}
      size={props.size ?? "md"}
      onChange={(event) => {
        setFilterParams((old) => {
          old.ongoing = event.currentTarget.checked;

          return old;
        });
      }}
    />
  );
}
