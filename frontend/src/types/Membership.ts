import { type Role } from "./Role"

export type Membership = {
  teamID: number,
  playerID: number,
  role: Role
}

export const DEFAULT_MEMBERSHIP: Membership = {
  teamID: 0,
  playerID: 0,
  role: 'none'
}

export const DEFAULT_MEMBER_PLAYER: Membership = {
  teamID: 0,
  playerID: 0,
  role: 'player'
}

export const DEFAULT_MEMBER_MANAGER: Membership = {
  teamID: 0,
  playerID: 0,
  role: 'manager'
}