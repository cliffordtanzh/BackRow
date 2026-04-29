from pydantic import BaseModel


class TeamEvent(BaseModel):
    eventID: int
    pointMethod: dict
    ownTotal: int
    oppTotal: int