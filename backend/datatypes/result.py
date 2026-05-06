from pydantic import BaseModel
from backend.datatypes.event import EventCreate


class Result(BaseModel):
    resultID: int
    playerID: int
    playerName: str
    teamID: int
    teamName: str
    youtubeURL: str
    gameName: str


class ResultCreate(BaseModel):
    events: list[EventCreate]
    isPlayerMode: bool
    playerID: int
    teamID: int
    youtubeURL: str
    gameName: str


class ResultQuery(BaseModel):
    isPlayerMode: bool
    playerID: int
    teamID: int