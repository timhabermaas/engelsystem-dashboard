import { newestLogSequenceNumber } from "~/db/repository";
import { emitter } from "./event-emitter";

export function registerAutoUpdate() {
setInterval(async () => {
  const sequenceNumber = await newestLogSequenceNumber();

  emitter.emit("update", sequenceNumber);
}, 5000);
}
