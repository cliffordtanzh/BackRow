from pydantic import BaseModel
from backend.datatypes import Event


class Results(BaseModel):
    summaryID: int
    playerID: int
    teamID: int
    youtubeURL: str
    gameName: str
    youtubeURL: str


class ResultsCreate(BaseModel):
    events: list[Event]
    isPlayerMode: bool
    playerID: int
    teamID: int
    youtubeURL: str
    gameName: str