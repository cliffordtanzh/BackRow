from pydantic import BaseModel


class Player(BaseModel):
    player_id: int
    player_name: str
    player_number: int
    team_name: str