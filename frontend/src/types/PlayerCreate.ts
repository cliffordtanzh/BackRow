export type PlayerCreate = {
  name: string,
  playerNumber: number,
  email: string,
  password: string,
}

export const DEFAULT_PLAYER_CREATE: PlayerCreate = {
  name: '', 
  playerNumber: -1, 
  email: '', 
  password: ''
}