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