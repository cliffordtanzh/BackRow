export type Result = {
  resultID: number,
  playerID: number,
  playerName: string,
  teamID: number,
  teamName: string,
  youtubeURL: string,
  gameName: string,
}

export const DEFAULT_RESULT = {
  resultID: 0,
  playerID: 0,
  playerName: '',
  teamID: 0,
  teamName: '',
  youtubeURL: '',
  gameName: '',
}