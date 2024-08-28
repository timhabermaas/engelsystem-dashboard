import { Switch } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";

export function FutureSlider() {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <Switch
      label="Present shifts only"
      checked={searchParams.get("ongoing") === "true"}
      size="lg"
      onChange={(event) => {
        if (event.currentTarget.checked) {
          setSearchParams(
            (params) => {
              params.set("ongoing", "true");
              return params;
            },
            { preventScrollReset: true }
          );
        } else {
          setSearchParams(
            (params) => {
              params.set("ongoing", "false");
              return params;
            },
            { preventScrollReset: true }
          );
        }
      }}
    />
  );
}
