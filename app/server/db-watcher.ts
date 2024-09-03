import { newestLogSequenceNumber } from "~/db/repository";
import { emitter } from "./event-emitter";

export function registerAutoUpdate() {
  setInterval(async () => {
    const sequenceNumber = await newestLogSequenceNumber();

    // TODO: We don't need to send down an event for every interval,
    // we could check for oldSequenceNumber != newSequenceNumber instead.
    emitter.emit("update", sequenceNumber);
  }, 5000);
}
