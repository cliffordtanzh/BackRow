import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.datatypes import Player, Team

app = FastAPI()

# Adding CORS to allow cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

# @app.post("/players")
# def post_players(player: Player):
#     players.append(player)
#     return player


# @app.post("/teams")
# def post_teams(team: Team):
#     teams.append(team)
#     print(teams)
#     return teams


@app.get("/players")
def get_players():
    conn = sqlite3.connect("backend/database/database.sqlite3")
    cursor = conn.cursor()

    team_query = cursor.execute("SELECT * FROM teams").fetchall()
    player_query = cursor.execute("SELECT * FROM players")

    player_columns = [col[0] for col in player_query.description]
    player_columns[-1] = "teamName"
    
    players = []
    for player_info in player_query.fetchall():
        # Have to convert teamID to teamName
        playerTeamID = player_info[3]
        teamName = [team for team in team_query if team[0] == playerTeamID][0][1]

        model_data = dict(zip(player_columns, list(player_info)[: -1] + [teamName]))
        players.append(Player.model_validate(model_data))
    
    return players


@app.get("/teams")
def get_teams():
    conn = sqlite3.connect("backend/database/database.sqlite3")
    cursor = conn.cursor()

    team_query = cursor.execute("SELECT * FROM teams")
    team_columns = [col[0] for col in team_query.description]

    teams = []
    for team_info in team_query.fetchall():
        model_data = dict(zip(team_columns, team_info))
        teams.append(Team.model_validate(model_data))
    
    return teams