from pydantic import BaseModel
from backend.datatypes import TeamEvent


class TeamResults(BaseModel):
    history: list[TeamEvent]
    gameName: str
    teamName: str