import { type Role } from "./Role"


export type JwtPayload = {
    playerID: number,       // Needed for changing self permissions
    playerName: string,     // Ease of display on History Panel
    email: string,          // For sending of any updates in the future
    role: Role,             // For checking current authorisation
    teamID: number,         // Saving of Team results
    teamName: string,       // Ease of display on History Panel
    exp: number,            // Nice to have
}