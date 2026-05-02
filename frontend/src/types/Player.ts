export type Player = {
  ID: number,
  name: string,
  playerNumber: number,
  email: string,
  isVerified: boolean
}

export const DEFAULT_PLAYER: Player = {
  ID: 0,
  name: '',
  playerNumber: 0,
  email: '',
  isVerified: false,
}