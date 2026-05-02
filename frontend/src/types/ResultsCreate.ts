import Event from "./Event"


export type ResultsCreate = {
    events: Event[],
    isPlayerMode: boolean,
    playerID: number,
    teamID: number,
    youtubeURL: string,
    gameName: string,
}