from pydantic import BaseModel
from api.datatypes.event import EventCreate


class Result(BaseModel):
    resultID: int
    youtubeURL: str
    gameName: str
    entityID: int


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
