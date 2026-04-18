import type { BiLabel } from './BiLabel.ts';
import type { Team } from './Team.ts';


export type TeamEvent = {
    eventID: number,
    selectedTeam: Team,
    gameName: string,
    pointMethod: BiLabel,
    ownPointTotal: number,
    oppPointTotal: number,
}