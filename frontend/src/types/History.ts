import Event from './Event';


export type History = {
  events: Event[],
  isPlayerMode: boolean,
  playerID: number,
  playerName: string,
  teamID: number,
  teamName: string,
  youtubeURL: string,
  gameName: string,
}


export const DEFAULT_HISTORY: History = {
  events: [],
  isPlayerMode: true,
  playerID: 0,
  playerName: '',
  teamID: 0,
  teamName: '',
  youtubeURL: '',
  gameName: '',
}