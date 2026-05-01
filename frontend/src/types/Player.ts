export type Player = {
  playerID: number,
  playerName: string,
  playerNumber: number,
  email: string,
  isVerified: boolean
}

export const DEFAULT_PLAYER: Player = {
  playerID: 0,
  playerName: '',
  playerNumber: 0,
  email: '',
  isVerified: false,
}