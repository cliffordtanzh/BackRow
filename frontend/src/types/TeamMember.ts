import { type Role, DEFAULT_ROLE  } from "./Role"


export type TeamMember = {
    teamID: number
    teamName: string
    playerID: number
    playerName: string
    role: Role
}

export const DEFAULT_TEAM_MEMBER = {
    teamID: 0,
    teamName: '',
    playerID: 0,
    playerName: '',
    role: DEFAULT_ROLE
}