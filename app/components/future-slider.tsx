import { Switch } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";

export function FutureSlider() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Switch
      label="Present shifts only"
      checked={searchParams.get("future") === "true"}
      size="lg"
      onChange={(event) => {
        if (event.currentTarget.checked) {
          setSearchParams(
            (params) => {
              params.set("future", "true");
              return params;
            },
            { preventScrollReset: true }
          );
        } else {
          setSearchParams(
            (params) => {
              params.set("future", "false");
              return params;
            },
            { preventScrollReset: true }
          );
        }
      }}
    />
  );
}
