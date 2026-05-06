import { type Event } from "./Event"


export type LoadedEvents = {
  resultID: number | null,
  isPlayerMode: boolean,
  events: Event[],
}

export const DEFAULT_LOADED_EVENT = {
  resultID: null,
  isPlayerMode: true,
  events: []
}