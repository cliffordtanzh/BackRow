from pydantic import BaseModel


class Team(BaseModel):
    teamID: int
    teamName: str