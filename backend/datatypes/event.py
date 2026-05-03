from pydantic import BaseModel


class Event(BaseModel):
    ID: int
    resultID: int
    eventType: dict
    pointDelta: int


class EventQuery(BaseModel):
    ID: int
    isPlayerMode: bool