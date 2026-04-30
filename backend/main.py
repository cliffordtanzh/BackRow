import os
import sqlite3
import bcrypt
import secrets

from jose import jwt
from jose.exceptions import JWTError

import smtplib
from email.message import EmailMessage

from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.datatypes import *


load_dotenv(Path(__file__).parent / ".env")


FRONTEND_URL = os.getenv("FRONTEND_URL")
DATABASE_URL = os.getenv("DATABASE_URL")

app = FastAPI()

# Adding CORS to allow cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins = [FRONTEND_URL],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)


@app.get("/player", status_code = 200)
def get_player():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        player_query = cursor.execute("SELECT * FROM player")
        query_col = [col[0] for col in player_query.description]
        query_res = player_query.fetchall()

        players = []
        for player_info in query_res:
            # Have to convert teamID to teamName
            data = dict(zip(query_col, player_info))
            del data["passwordHash"]
            players.append(Player.model_validate(data))
    
        return {"data": players, "detail": "Player queried successfully"}
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
    
    finally:
        conn.close()


@app.get("/team", status_code = 200)
def get_team():
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
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
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
    
    finally:
        conn.close()


@app.post("/team", status_code = 201)
def post_team(team: TeamCreate):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO team (teamName) VALUES (?)",
            (team.teamName, )
        )
        
        conn.commit()
        return {"detail": "Team posted successfully"}
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
    
    finally:
        conn.close()


@app.post("/team_results", status_code = 201)
def post_team_results(payload: TeamResults):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
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

        conn.commit()
        return {"detail": "Team results posted succssfully"}
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
    
    finally:
        conn.close()


@app.post("/register", status_code = 201)
def register(player: PlayerCreate):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
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

        # Set up email details
        sender_email = os.getenv("EMAIL_ADDRESS")
        password = os.getenv("EMAIL_PASSWORD") 
        receiver_email = player.email

        # Create the message
        msg = EmailMessage()
        msg["Subject"] = "Backrow Verification"
        msg["From"] = sender_email
        msg["To"] = receiver_email
        msg.set_content(
            "Click on this link to verify your account\n"
            f"{os.getenv('BACKEND_URL')}/verify?token={verf_token}"
        )
        
        try:
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()  # Secure the connection
                server.login(sender_email, password)
                server.send_message(msg)
            print("Email sent successfully!")
        except Exception as e:
            print(f"Error: {e}")

        conn.commit()
        return {"detail": "Player registration request sent"}
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))

    finally:
        conn.close()


@app.get("/verify", status_code = 200)
def verify(token: str):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        time_now = datetime.now(timezone.utc)
        token_query = cursor.execute(
            """
            SELECT 
                *
            FROM 
                player 
            INNER JOIN verification ON verification.playerID = player.playerID
            WHERE verification.token = (?)
            """,
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
        return RedirectResponse(url = os.envget("FRONTEND_URL"))
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))

    finally:
        conn.close()


@app.post("/login", status_code = 201)
def login(player: PlayerLogin):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
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
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
        
    finally:
        conn.close()


# JWT dependency
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorisation")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code = 401, detail = "Missing of invalid Authorisation header")
    
    token = auth_header.split(" ")[1]

    try:
        jwt_secret = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, jwt_secret, algorithms = ["HS256"])
        return payload
    
    except JWTError:
        raise HTTPException(status_code = 401, detail = "Invalid or Expired token")
    

# Protected Endpoints
@app.post("/update_membership")
async def update_membership(update: Membership, user = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        if user["role"] not in ["root"]:
            raise HTTPException(status_code = 401, detail = "Invalid Authorisation")

        query = cursor.execute(
            """
            SELECT 
                * 
            FROM player
            INNER JOIN membership ON membership.playerID = player.playerID
            INNER JOIN team ON membership.teamID = team.teamID
            WHERE player.playerID = (?)
            """,
            (update.playerID, )
        )

        result = query.fetchone()
        if result is None:
            raise HTTPException(status_code = 404, detail = "Player not found")
        
        cols = [col[0] for col in query.description]
        data = dict(zip(cols, result))

        if data["teamID"] != update.teamID:
            cursor.execute(
                "UPDATE membership SET teamID = (?) WHERE playerID = (?)",
                (update.teamID, update.playerID)
            )

        if data["role"] != update.role:
            cursor.execute(
                "UPDATE membership SET role = (?) WHERE playerID = (?)",
                (update.role, update.playerID)
            )

        conn.commit()
        return user
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
    
    finally:
        conn.close()