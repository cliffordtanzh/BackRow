from typing import Optional
from enum import Enum
from pydantic import BaseModel


class Role(Enum):
    none = "none"
    player = "player"
    manager = "manager"
    root = "root"


class Membership(BaseModel):
    playerID: int
    teamID: Optional[int]
    role: Role