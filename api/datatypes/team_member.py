from pydantic import BaseModel
from api.datatypes.membership import Role


class TeamMember(BaseModel):
    teamID: int
    teamName: str
    playerID: int
    playerName: str
    role: Role
