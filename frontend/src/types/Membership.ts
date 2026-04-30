export type Membership = {
    teamID: number,
    playerID: number,
    role: 'player' | 'manager' | 'root'
}