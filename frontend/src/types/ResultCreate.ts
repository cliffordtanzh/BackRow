import Event from "./EventCreate"


export type ResultCreate = {
    events: Event[],
    isPlayerMode: boolean,
    playerID: number,
    teamID: number,
    youtubeURL: string,
    gameName: string,
}