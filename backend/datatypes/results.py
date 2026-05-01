from pydantic import BaseModel
from backend.datatypes import Event


class Results(BaseModel):
    resultID: int
    history: list[Event]
    playerName: str
    gameName: str
    teamName: str


class ResultsCreate(BaseModel):
    history: list[Event]
    playerName: str
    gameName: str
    teamName: str