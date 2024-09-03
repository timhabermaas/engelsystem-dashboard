import { useRevalidator } from "@remix-run/react";
import { useEffect } from "react";
import { useEventSource } from "remix-utils/sse/react";

export function LiveUpdate() {
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

  return <></>;
}
