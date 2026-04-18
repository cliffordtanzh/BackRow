from pydantic import BaseModel


class Player(BaseModel):
    playerID: int
    playerName: str
    playerNumber: int
    teamName: str