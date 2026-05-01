import Event from "./Event"


export type ResultsCreate = {
    history: Event[],
    playerName: string,
    gameName: string,
    teamName: string,
}