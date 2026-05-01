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
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/player", status_code=200)
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
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.get("/team", status_code=200)
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
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/team", status_code=201)
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
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/register", status_code=201)
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
            raise HTTPException(
                status_code=409, detail="Email is already in use")

        password_hash = bcrypt.hashpw(
            player.password.encode("utf-8"), bcrypt.gensalt())
        password_hash = password_hash.decode("utf-8")

        verf_token = secrets.token_urlsafe(32)
        expiry = datetime.now(timezone.utc) + timedelta(hours=24)

        cursor.execute(
            """
            INSERT INTO player (
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
            "INSERT INTO membership (playerID, role) VALUES (?, ?)",
            (playerID, "none")
        )

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
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.get("/verify", status_code=200)
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
            raise HTTPException(status_code=404, detail="Token not found")

        data = dict(zip(table_col, query_res))
        expiry = datetime.fromisoformat(
            data["expiry"]).replace(tzinfo=timezone.utc)

        if time_now > expiry:
            cursor.execute(
                "DELETE FROM verification WHERE token = (?)", (token, ))
            raise HTTPException(status_code=410, detail="Token expired")

        # Verification complete
        cursor.execute(
            "UPDATE player SET isVerified = 1 WHERE playerID = (?)",
            (data["playerID"], )
        )
        cursor.execute(
            "UPDATE membership SET role = 'player' WHERE playerID = (?)",
            (data["playerID"], )
        )
        cursor.execute("DELETE FROM verification WHERE token = (?)", (token, ))

        conn.commit()
        return RedirectResponse(url=os.getenv("FRONTEND_URL"))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/login", status_code=201)
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
            LEFT OUTER JOIN team ON team.teamID = membership.teamID
            WHERE player.email = (?)""",
            (player.email, )
        )

        query_col = [col[0] for col in email_query.description]
        query_res = email_query.fetchone()
        if query_res is None:
            raise HTTPException(status_code=404, detail="Email not found")

        data = dict(zip(query_col, query_res))
        login = bcrypt.checkpw(
            player.password.encode("utf-8"),
            data["passwordHash"].encode("utf-8")
        )

        if not login:
            raise HTTPException(status_code=401, detail="Wrong password")

        secret = os.getenv("JWT_SECRET")
        jwt_exp = datetime.now(timezone.utc) + timedelta(hours=24)
        payload = {
            "playerID": data["playerID"],
            "playerName": data["playerName"],
            "email": player.email,
            "role": data["role"],
            "teamID": data["teamID"],
            "teamName": data["teamName"],
            "exp": int(jwt_exp.timestamp())
        }

        Jwt_token = jwt.encode(payload, secret, algorithm="HS256")
        return {"data": Jwt_token, "detail": "Login successful"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


# JWT dependency
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorisation")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing of invalid Authorisation header")

    token = auth_header.split(" ")[1]

    try:
        jwt_secret = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or Expired token")


# Protected Endpoints
@app.post("/update_membership")
async def update_membership(update: Membership, user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        if user["role"] not in ["root"]:
            raise HTTPException(
                status_code=401, detail="trying something funny?")

        query = cursor.execute(
            """
            SELECT 
                * 
            FROM player
            INNER JOIN membership ON membership.playerID = player.playerID
            FULL OUTER JOIN team ON membership.teamID = team.teamID
            WHERE player.playerID = (?)
            """,
            (update.playerID, )
        )

        result = query.fetchone()
        if result is None:
            raise HTTPException(status_code=404, detail="Player not found")

        cols = [col[0] for col in query.description]
        data = dict(zip(cols, result))

        new_user = {**user}
        if data["teamID"] != update.teamID:
            cursor.execute(
                "UPDATE membership SET teamID = (?) WHERE playerID = (?)",
                (update.teamID, update.playerID)
            )
            new_user["teamID"] = update.teamID

        if data["role"] != update.role:
            cursor.execute(
                "UPDATE membership SET role = (?) WHERE playerID = (?)",
                (update.role, update.playerID)
            )
            new_user["role"] = update.role


        secret = os.getenv("JWT_SECRET")
        new_token = jwt.encode(new_user, secret, algorithm="HS256")

        conn.commit()
        return {"data": new_token, "detail": "Membership updated"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/change_password")
def change_password(passwords: dict[str, str], user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        query = cursor.execute(
            "SELECT * FROM player WHERE playerID = (?)",
            (user["playerID"], )
        )
        cols = [col[0] for col in query.description]
        result = query.fetchone()

        if result is None:
            raise HTTPException(status_code=404, detail="User not found")

        data = dict(zip(cols, result))
        login = bcrypt.checkpw(
            passwords["old"].encode("utf-8"),
            data["passwordHash"].encode("utf-8")
        )

        if (not login) and (passwords["old"] != "forgot..."):
            raise HTTPException(status_code=401, detail="Wrong password")

        password_hash = bcrypt.hashpw(
            passwords["new"].encode("utf-8"), bcrypt.gensalt())
        password_hash = password_hash.decode("utf-8")

        cursor.execute(
            "UPDATE player SET passwordHash = (?) WHERE playerID = (?)",
            (password_hash, user["playerID"])
        )

        conn.commit()
        return {"detail": "Password changed"}

    finally:
        conn.rollback()
        conn.close()


@app.post("/team_results", status_code=201)
def post_team_results(payload: ResultsCreate, user=Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    try:
        history = payload.history
        gameName = payload.gameName
        teamName = payload.teamName

        if user["teamID"] is None:
            raise HTTPException(
                status_code = 404, 
                detail = "A team has not been assign to you yet"
            )
        
        if len(history) == 0:
            raise HTTPException(status_code = 422, detail = "No data to post")
        
        cursor.execute(
            """
            INSERT INTO team_result (
                gameName, 
                teamName, 
            ) VALUES (?, ?)""",
            (gameName, teamName)
        )
        resultID = cursor.lastrowid

        for event in history:
            cursor.execute(
                """
                INSERT INTO team_event (
                    eventID, 
                    resultID, 
                    pointMethod, 
                    pointDelta
                )  VALUES (?, ?, ?, ?)""",
                (
                    event.eventID,
                    resultID,
                    event.eventType["en"],
                    event.pointDelta,
                )
            )

        # conn.commit()
        conn.rollback()
        return {"detail": "Team results posted succssfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/player_results", status_code=201)
def post_player_results(payload: ResultsCreate, user=Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        history = payload.history
        gameName = payload.gameName
        playerName = payload.playerName

        cursor.execute(
            """
            INSERT INTO player_result (
                gameName, 
                playerName
            ) VALUES (?, ?)""",
            (gameName, playerName)
        )
        summaryID = cursor.lastrowid

        for event in history:
            cursor.execute(
                """
                INSERT INTO player_event (
                    eventID, 
                    summaryID, 
                    eventType, 
                    pointDelta
                )  VALUES (?, ?, ?, ?)""",
                (
                    event.eventID,
                    summaryID,
                    event.eventType["en"],
                    event.pointDelta,
                )
            )

        # conn.commit()
        conn.rollback()
        return {"detail": "Player results posted succssfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()
