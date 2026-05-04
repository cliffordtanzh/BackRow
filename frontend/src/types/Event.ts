import type { BiLabel } from "./BiLabel"


export type Event = {
    ID: number
    resultID: number
    eventType: BiLabel
    pointDelta: number
}