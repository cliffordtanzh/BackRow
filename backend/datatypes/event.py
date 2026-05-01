from pydantic import BaseModel


class Event(BaseModel):
    eventID: int
    eventType: dict
    pointDelta: int