from pydantic import BaseModel


class Player(BaseModel):
    ID: int
    name: str
    playerNumber: int
    email: str
    isVerified: bool


class PlayerCreate(BaseModel):
    name: str
    playerNumber: int
    email: str
    password: str


class PlayerLogin(BaseModel):
    email: str
    password: str