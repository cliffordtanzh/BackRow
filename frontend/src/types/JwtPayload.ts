export type JwtPayload = {
    name: string,
    email: string,
    role: 'player' | 'manager' | 'root',
    exp: number,
}