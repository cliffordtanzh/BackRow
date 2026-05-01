export type PlayerCreate = {
    playerName: string,
    playerNumber: number,
    email: string,
    password: string,
}

export const DEFAULT_PLAYER_CREATE: PlayerCreate = {
  playerName: '', 
  playerNumber: -1, 
  email: '', 
  password: ''
}