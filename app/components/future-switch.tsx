import { MantineSize, Switch } from "@mantine/core";
import { useEffect, useState } from "react";
import { useFilterParams } from "~/hooks/use-filter-params";

interface FutureSwitchProps {
  size?: MantineSize;
}

export function FutureSwitch(props: FutureSwitchProps) {
  const [filterParams, setFilterParams] = useFilterParams();

  const [checked, setChecked] = useState<boolean>(filterParams.ongoing);

  // The only reason for internal state is to enable an optimistic UI. If we go
  // through the entire "change search params", "rerender", "update switch
  // according to search params" workflow toggling the switch lags. So we
  // toggle it immediately and move rerendering/filtering to the next
  // iteration.
  useEffect(() => {
    setFilterParams((old) => {
      old.ongoing = checked;

      return old;
    });
  }, [checked]);

  return (
    <Switch
      label="Present shifts only"
      checked={checked}
      size={props.size ?? "md"}
      onChange={(event) => {
        setChecked(event.currentTarget.checked);
      }}
    />
  );
}
