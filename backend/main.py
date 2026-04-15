from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.types.player import Player
from backend.types.team import Team


app = FastAPI()

# Adding CORS to allow cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

players = [
    Player(player_id = 1, player_name = "Cliffy", player_number = 7, team_name = "SKVB"),
    Player(player_id = 2, player_name = "Julian", player_number = 19, team_name = "SKVB"),
    Player(player_id = 3, player_name = "Yolo", player_number = 13, team_name = "SKVB"),
    Player(player_id = 4, player_name = "Hong", player_number = 11, team_name = "SKVB"),
    
    Player(player_id = 5, player_name = "Terrence", player_number = 21, team_name = "Super Titans"),
    Player(player_id = 6, player_name = "Eric", player_number = 69, team_name = "Super Titans"),
]
teams = [
    Team(team_id = 1, team_name = "SKVB"), 
    Team(team_id = 2, team_name = "Super Titans"), 
]

@app.post("/players")
def post_player(player: Player):
    players.append(player)
    return player

@app.get("/players")
def get_players():
    return players

@app.get("/teams")
def get_teams():
    return teams