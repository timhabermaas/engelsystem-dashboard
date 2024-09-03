import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { emitter } from "~/server/event-emitter";

export async function loader({ request }: LoaderFunctionArgs) {
  return eventStream(request.signal, (send, _b) => {
    console.log("Setting up SSR listener");
    const listener = (sequenceNumber: number) => {
      console.log(`Updating sequence number to ${sequenceNumber}`);
      send({ event: "update", data: sequenceNumber.toString() });
    };
    emitter.on("update", listener);

    return () => {
      console.log("Removing update listener");
      emitter.off("update", listener);
    };
  });
}
