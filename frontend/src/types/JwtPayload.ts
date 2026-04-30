import type { Role } from "./Role"


export type JwtPayload = {
    playerName: string,
    playerID: number,
    email: string,
    role: Role,
    exp: number,
}