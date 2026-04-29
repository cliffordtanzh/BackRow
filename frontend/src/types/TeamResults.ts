import type { TeamEvent } from './TeamEvent';


export type TeamResults = {
    history: TeamEvent[],
    gameName: string,
    teamName: string,
}