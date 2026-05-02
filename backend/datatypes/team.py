from pydantic import BaseModel


class Team(BaseModel):
    ID: int
    name: str


class TeamCreate(BaseModel):
    name: str