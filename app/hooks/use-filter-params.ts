import { useSearchParams } from "@remix-run/react";

interface FilterParams {
  ongoing: boolean;
}

type SerializedFilterParams = { [P in keyof FilterParams]: string };

export function useFilterParams(): [
  FilterParams,
  (cb: (old: FilterParams) => FilterParams) => void
] {
  const [searchParams, setSearchParams] = useSearchParams();

  const filterParams = parseFilterParams(searchParams);
  const setFilterParams = (cb: (old: FilterParams) => FilterParams) => {
    setSearchParams(
      (p) => {
        const old = parseFilterParams(p);
        const updated = cb(old);
        return serializeParams(updated);
      },
      { preventScrollReset: true }
    );
  };

  return [filterParams, setFilterParams];
}

export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  return { ongoing: searchParams.get("ongoing") === "true" };
}

function serializeParams(filterParams: FilterParams): SerializedFilterParams {
  return {
    ongoing: filterParams.ongoing.toString(),
  };
}
