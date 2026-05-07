from pydantic import BaseModel
from backend.datatypes.membership import Role


class TeamMember(BaseModel):
    teamID: int
    teamName: str
    playerID: int
    playerName: str
    role: Role