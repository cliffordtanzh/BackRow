from pydantic import BaseModel


class Player(BaseModel):
    playerID: int
    playerName: str
    playerNumber: int
    email: str
    isVerified: bool


class PlayerCreate(BaseModel):
    playerName: str
    playerNumber: int
    email: str
    password: str


class PlayerLogin(BaseModel):
    email: str
    password: str