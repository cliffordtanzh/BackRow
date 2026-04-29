import os
import sqlite3
import bcrypt
import secrets

from jose import jwt
from jose.exceptions import JWTError

from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI
from fastapi import Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.datatypes import *


load_dotenv(Path(__file__).parent / ".env")


ORIGIN_URL = os.getenv("ORIGIN_URL")
DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI()

# Adding CORS to allow cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins = [ORIGIN_URL],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)


@app.get("/player", status_code = 200)
def get_player():
    try:
        conn = sqlite3.connect(DATABASE_URL)
        cursor = conn.cursor()

        player_query = cursor.execute(
            "SELECT * FROM player"
        )
        query_col = [col[0] for col in player_query.description]
        query_res = player_query.fetchall()

        players = []
        for player_info in query_res:
            # Have to convert teamID to teamName
            data = dict(zip(query_col, player_info))
            players.append(Player.model_validate(data))
    
        return {"data": players, "detail": "Player queried successfully"}
    
    finally:
        conn.close()


@app.get("/team", status_code = 200)
def get_team():
    try:
        conn = sqlite3.connect(DATABASE_URL)
        cursor = conn.cursor()

        team_query = cursor.execute("SELECT * FROM team")
        team_columns = [col[0] for col in team_query.description]

        teams = []
        for team_info in team_query.fetchall():
            model_data = {
                key: value for key, value in zip(team_columns, team_info)
                if key != "passwordHash"
            }
            teams.append(Team.model_validate(model_data))
        
        return {"data": teams, "detail": "Team queried successfully"}
    
    finally:
        conn.close()


@app.post("/team", status_code = 201)
def post_team(team: TeamCreate):
    try:
        conn = sqlite3.connect(DATABASE_URL)
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO team (teamName) VALUES (?)",
            (team.teamName, )
        )
        
        conn.commit()
        return {"detail": "Team posted successfully"}
    
    finally:
        conn.close()


@app.post("/team_results", status_code = 201)
def post_team_results(payload: TeamResults):
    try:
        conn = sqlite3.connect(DATABASE_URL)
        cursor = conn.cursor()

        history = payload.history
        gameName = payload.gameName
        teamName = payload.teamName
        ownTotal = history[-1].ownTotal
        oppTotal = history[-1].oppTotal

        cursor.execute(
            """INSERT INTO team_summary (
                gameName, 
                teamName, 
                ownTotal,
                oppTotal
            ) VALUES (?, ?, ?, ?)""",
            (gameName, teamName, ownTotal, oppTotal)
        )
        summaryID = cursor.lastrowid

        for event in history:
            cursor.execute(
                """INSERT INTO team_event (
                    eventID, 
                    summaryID, 
                    pointMethod, 
                    ownTotal, 
                    oppTotal
                )  VALUES (?, ?, ?, ?, ?)""",
                (
                    event.eventID, 
                    summaryID, 
                    event.pointMethod["en"], 
                    event.ownTotal,
                    event.oppTotal,
                )
            )

        # conn.commit()
        conn.rollback()
        return {"detail": "Team results posted succssfully"}
    
    finally:
        conn.close()


@app.post("/register", status_code = 201)
def register(player: PlayerCreate):
    try:
        conn = sqlite3.connect(DATABASE_URL)
        cursor = conn.cursor()

        email_query = cursor.execute(
            "SELECT email FROM player WHERE email == (?)",
            (player.email, )
        )
        query_res = email_query.fetchone()

        # Email query from DB should return None
        if query_res is not None:
            raise HTTPException(status_code = 409, detail = "Email is already in use")
        
        password_hash = bcrypt.hashpw(player.password.encode("utf-8"), bcrypt.gensalt())
        password_hash = password_hash.decode("utf-8")

        verf_token = secrets.token_urlsafe(32)
        expiry = datetime.now(timezone.utc) + timedelta(hours = 24)

        cursor.execute(
            """INSERT INTO player (
                playerName, 
                playerNumber, 
                email, 
                passwordHash, 
                isVerified
            ) VALUES (?, ?, ?, ?, ?)""", 
            (player.playerName, player.playerNumber, player.email, password_hash, 0)
        )
        playerID = cursor.lastrowid

        cursor.execute(
            "INSERT INTO verification (playerID, token, expiry) VALUES (?, ?, ?)",
            (playerID, verf_token, expiry)
        )

        print(verf_token)

        conn.commit()
        return {"detail": "Player registration request sent"}

    finally:
        conn.close()


@app.get("/verify", status_code = 200)
def verify(token: str):
    try:
        conn = sqlite3.connect(DATABASE_URL)
        cursor = conn.cursor()

        time_now = datetime.now(timezone.utc)
        token_query = cursor.execute(
            """SELECT 
                *
            FROM 
                player 
            INNER JOIN verification ON verification.playerID = player.playerID
            WHERE verification.token = (?)""",
            (token, )
        )
        query_res = token_query.fetchone()
        table_col = [col[0] for col in token_query.description]

        if query_res is None:
            raise HTTPException(status_code = 404, detail = "Token not found")
        
        data = dict(zip(table_col, query_res))
        expiry = datetime.fromisoformat(data["expiry"]).replace(tzinfo = timezone.utc)

        if time_now > expiry:
            cursor.execute("DELETE FROM verification WHERE token = (?)", (token, ))
            raise HTTPException(status_code = 410, detail = "Token expired")
        
        # Verification complete
        cursor.execute(
            "UPDATE player SET isVerified = 1 WHERE playerID = (?)", 
            (data["playerID"], )
        )
        cursor.execute(
            "INSERT INTO membership (playerID, role) VALUES (?, ?)",
            (data["playerID"], "player")
        )
        cursor.execute("DELETE FROM verification WHERE token = (?)", (token, ))
        
        conn.commit()
        return {"detail": "Player registered successfully"}

    finally:
        conn.close()


@app.post("/login", status_code = 201)
def login(player: PlayerLogin):
    try:
        conn = sqlite3.connect(DATABASE_URL)
        cursor = conn.cursor()

        email_query = cursor.execute(
            """
            SELECT 
                * 
            FROM 
                player 
            INNER JOIN membership ON membership.playerID = player.playerID
            WHERE player.email = (?)""",
            (player.email, )
        )
        
        query_col = [col[0] for col in email_query.description]
        query_res = email_query.fetchone()
        if query_res is None:
            raise HTTPException(status_code = 404, detail = "Email not found")

        data = dict(zip(query_col, query_res))        
        login = bcrypt.checkpw(
            player.password.encode("utf-8"), 
            data["passwordHash"].encode("utf-8")
        )

        if not login:
            raise HTTPException(status_code = 401, detail = "Wrong password")
        
        secret = os.getenv("JWT_SECRET")
        jwt_exp = datetime.now(timezone.utc) + timedelta(hours = 24)
        payload = {
            "name": data["playerName"],
            "email": player.email, 
            "role": data["role"],
            "exp": int(jwt_exp.timestamp())
        }
        
        jwt_string = jwt.encode(payload, secret, algorithm = "HS256")
        return {"data": jwt_string, "detail": "Login successful"}
        
    finally:
        conn.close()


# JWT dependency
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code = 401, detail = "Missing of invalid Authorization header")
    
    token = auth_header.split(" ")[1]

    try:
        jwt_secret = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, jwt_secret, algorithms = ["HS256"])
        return payload
    
    except JWTError:
        raise HTTPException(status_code = 401, detail = "Invalid or Expired token")
    

@app.get("/me")
async def read_me(user = Depends(get_current_user)):
    print(user)
    return user