from pydantic import BaseModel


class Membership(BaseModel):
    playerID: int
    teamID: int
    role: str