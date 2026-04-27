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
    Player(playerID = 1, playerName = "Cliffy", playerNumber = 7, teamName = "SKVB"),
    Player(playerID = 2, playerName = "Julian", playerNumber = 19, teamName = "SKVB"),
    Player(playerID = 3, playerName = "Yolo", playerNumber = 13, teamName = "SKVB"),
    Player(playerID = 4, playerName = "Hong", playerNumber = 11, teamName = "SKVB"),
    
    Player(playerID = 5, playerName = "Terrence", playerNumber = 21, teamName = "Super Titans"),
    Player(playerID = 6, playerName = "Eric", playerNumber = 69, teamName = "Super Titans"),
]
teams = [
    Team(teamID = 1, teamName = "SKVB"), 
    Team(teamID = 2, teamName = "Super Titans"), 
]


@app.post("/players")
def post_players(player: Player):
    players.append(player)
    return player


@app.post("/teams")
def post_teams(team: Team):
    teams.append(team)
    return teams


@app.get("/players")
def get_players():
    return players


@app.get("/teams")
def get_teams():
    return teams