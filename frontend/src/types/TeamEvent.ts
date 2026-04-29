import type { BiLabel } from './BiLabel.ts';


export type TeamEvent = {
    eventID: number,
    pointMethod: BiLabel,
    ownTotal: number,
    oppTotal: number,
}