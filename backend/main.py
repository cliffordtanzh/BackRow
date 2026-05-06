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
import json
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.datatypes import *


load_dotenv(Path(__file__).parent / ".env")


FRONTEND_URL = os.getenv("FRONTEND_URL")
DATABASE_URL = os.getenv("DATABASE_URL")

TEAM_STATS = json.load(open("frontend/src/assets/team_stats.json"))
PLAYER_STATS = json.load(open("frontend/src/assets/player_stats.json"))

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
        query = cursor.execute("SELECT * FROM player")
        cols = [col[0] for col in query.description]
        result = query.fetchall()

        players = []
        for values in result:
            data = dict(zip(cols, values))
            del data["passwordHash"]

            players.append(Player.model_validate(data))

        return {"data": players, "detail": "player_query_success"}

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
        query = cursor.execute("SELECT * FROM team")
        cols = [col[0] for col in query.description]
        result = query.fetchall()

        teams = []
        for values in result:
            data = dict(zip(cols, values))
            teams.append(Team.model_validate(data))

        return {"data": teams, "detail": "team_query_success"}

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
            "INSERT INTO team (name) VALUES (?)",
            (team.name, )
        )

        conn.commit()
        return {"detail": "team_post_success"}

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
        query = cursor.execute(
            "SELECT email FROM player WHERE email == (?)",
            (player.email, )
        )
        values = query.fetchone()

        # Email query from DB should return None
        if values is not None:
            raise HTTPException(
                status_code=409, detail="email_in_use_error")

        password_hash = bcrypt.hashpw(
            player.password.encode("utf-8"), bcrypt.gensalt())
        password_hash = password_hash.decode("utf-8")

        verf_token = secrets.token_urlsafe(32)
        expiry = datetime.now(timezone.utc) + timedelta(hours=24)

        cursor.execute(
            """
            INSERT INTO player (
                name, 
                playerNumber, 
                email, 
                passwordHash, 
                isVerified
            ) VALUES (?, ?, ?, ?, ?)""",
            (player.name, player.playerNumber, player.email, password_hash, 0)
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

        print(verf_token)

        # # Set up email details
        # sender_email = os.getenv("EMAIL_ADDRESS")
        # password = os.getenv("EMAIL_PASSWORD")
        # receiver_email = player.email

        # # Create the message
        # msg = EmailMessage()
        # msg["Subject"] = "Backrow Verification"
        # msg["From"] = sender_email
        # msg["To"] = receiver_email
        # msg.set_content(
        #     "Click on this link to verify your account\n"
        #     f"{os.getenv("BACKEND_URL")}/verify?token={verf_token}"
        # )

        # try:
        #     with smtplib.SMTP("smtp.gmail.com", 587) as server:
        #         server.starttls()  # Secure the connection
        #         server.login(sender_email, password)
        #         server.send_message(msg)

        # except Exception as e:
        # raise HTTPException(status_code = 500, detail = str(e))

        conn.commit()
        return {"detail": "player_registration_success"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.get("/verify", status_code=200)
def verify(token: str):
    print(token)
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        time_now = datetime.now(timezone.utc)
        query = cursor.execute(
            """
            SELECT 
                *
            FROM 
                player 
            INNER JOIN verification ON verification.playerID = player.ID
            WHERE verification.token = (?)
            """,
            (token, )
        )
        cols = [col[0] for col in query.description]
        values = query.fetchone()

        if values is None:
            raise HTTPException(status_code=404, detail="Token not found")

        data = dict(zip(cols, values))
        expiry = datetime.fromisoformat(
            data["expiry"]).replace(tzinfo=timezone.utc)

        if time_now > expiry:
            cursor.execute(
                "DELETE FROM verification WHERE token = (?)", (token, ))
            raise HTTPException(status_code=410, detail="verification_error")

        # Verification complete
        cursor.execute(
            "UPDATE player SET isVerified = 1 WHERE ID = (?)",
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
        query = cursor.execute(
            """
            SELECT 
                player.ID AS playerID,
                player.name AS playerName,
                player.playerNumber,
                player.email,
                player.passwordHash,
                membership.role,
                team.ID AS teamID,
                team.name AS teamName
            FROM 
                player 
            INNER JOIN membership ON membership.playerID = player.ID
            LEFT OUTER JOIN team ON team.ID = membership.teamID
            WHERE player.email = (?)""",
            (player.email, )
        )

        cols = [col[0] for col in query.description]

        values = query.fetchone()
        if values is None:
            raise HTTPException(
                status_code=404, detail="email_not_found_error")

        data = dict(zip(cols, values))
        login = bcrypt.checkpw(
            player.password.encode("utf-8"),
            data["passwordHash"].encode("utf-8")
        )

        if not login:
            raise HTTPException(status_code=401, detail="wrong_password_error")

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

        jwt_token = jwt.encode(payload, secret, algorithm="HS256")
        return {"data": jwt_token, "detail": "login_success"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/fetch_events", status_code=200)
def fetch_events(query: EventQuery):
    def repack_event_type(event_type, isPlayerMode):
        stats = PLAYER_STATS if isPlayerMode else TEAM_STATS
        for events in stats.values():
            for event in events:
                if event["en"] != event_type:
                    continue

                return event

    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        isPlayerMode = query.isPlayerMode
        entityName = "player" if isPlayerMode else "team"
        eventTypeName = "eventType" if isPlayerMode else "pointMethod"

        event_query = cursor.execute(f"""
            SELECT
                *
            FROM
                {entityName}_event
            WHERE
                resultID=(?)""",
            (query.ID, )
        )

        cols = [col[0] for col in event_query.description]
        results = event_query.fetchall()

        events = []
        for values in results:
            data = {
                key: value
                for key, value in zip(cols, values)
            }

            eventType = repack_event_type(data[eventTypeName], isPlayerMode)
            del data[eventTypeName]
            data["eventType"] = eventType

            events.append(Event.model_validate(data))

        return {"data": events, "detail": "fetch_events_success"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code = 500, detail = str(e))
    
    finally:
        conn.rollback()
        conn.close()


# JWT dependency
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorisation")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="invalid_auth_error")

    token = auth_header.split(" ")[1]

    try:
        jwt_secret = os.getenv("JWT_SECRET")
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        return payload

    except JWTError:
        raise HTTPException(status_code=401, detail="invalid_token_error")


# Protected Endpoints
@app.post("/update_membership")
async def update_membership(update: Membership, user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        if user["role"] not in ["root"]:
            raise HTTPException(status_code=401, detail="funnyman")

        query = cursor.execute(
            """
            SELECT 
                * 
            FROM 
                player
            /*Team might be None, use outer join*/
            INNER JOIN membership ON membership.playerID = player.ID
            FULL OUTER JOIN team ON membership.teamID = team.ID
            WHERE player.ID = (?)
            """,
            (update.playerID, )
        )

        result = query.fetchone()
        if result is None:
            raise HTTPException(
                status_code=404, detail="player_not_found_error")

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
        return {"data": new_token, "detail": "membership_update_success"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/change_password")
def change_password(passwords: PasswordData, user: dict = Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        query = cursor.execute(
            "SELECT * FROM player WHERE ID = (?)",
            (user["playerID"], )
        )
        cols = [col[0] for col in query.description]
        result = query.fetchone()

        if result is None:
            raise HTTPException(
                status_code=404, detail="player_not_found_error")

        data = dict(zip(cols, result))
        login = bcrypt.checkpw(
            passwords.oldPassword.encode("utf-8"),
            data["passwordHash"].encode("utf-8")
        )

        if (not login) and (passwords.oldPassword != "forgot..."):
            raise HTTPException(status_code=401, detail="wrong_password_error")

        password_hash = bcrypt.hashpw(
            passwords.newPassword.encode("utf-8"), bcrypt.gensalt())
        password_hash = password_hash.decode("utf-8")

        cursor.execute(
            "UPDATE player SET passwordHash = (?) WHERE ID = (?)",
            (password_hash, user["playerID"])
        )

        conn.commit()
        return {"detail": "password_change_success"}
    
    except Exception as e:
        raise HTTPException(status_code = 500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/post_results", status_code=201)
def post_results(payload: ResultCreate, user=Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        events = payload.events
        isPlayerMode = payload.isPlayerMode
        playerID = payload.playerID
        teamID = payload.teamID
        youtubeURL = payload.youtubeURL
        gameName = payload.gameName

        if (not isPlayerMode) and (user["teamID"] is None):
            raise HTTPException(
                status_code=404,
                detail="unassigned_team_error"
            )

        if len(events) == 0:
            raise HTTPException(status_code=422, detail="no_results_error")

        entityName = "player" if isPlayerMode else "team"
        eventTypeName = "eventType" if isPlayerMode else "pointMethod"
        cursor.execute(
            f"""
            INSERT INTO {entityName}_result (
                youtubeURL,
                gameName,
                {entityName}ID
            ) VALUES (?, ?, ?)""",
            (youtubeURL, gameName, playerID if isPlayerMode else teamID)
        )
        resultID = cursor.lastrowid

        for event in events:
            cursor.execute(
                f"""
                INSERT INTO {entityName}_event (
                    ID, 
                    resultID, 
                    {eventTypeName}, 
                    pointDelta
                )  VALUES (?, ?, ?, ?)""",
                (
                    event.ID,
                    resultID,
                    event.eventType["en"],
                    event.pointDelta,
                )
            )

        conn.commit()
        return {"detail": "results_post_success"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()


@app.post("/fetch_results", status_code=200)
def fetch_results(query: ResultQuery, user=Depends(get_current_user)):
    conn = sqlite3.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        isPlayerMode = query.isPlayerMode
        entityName = "player" if isPlayerMode else "team"

        results_query = cursor.execute(
            f"""
            SELECT
                player.ID AS playerID,
                player.name AS playerName,
                team.ID AS teamID,
                team.name AS teamName,
                {entityName}_result.ID AS resultID,
                {entityName}_result.youtubeURL,
                {entityName}_result.gameName
            FROM 
                player
            /*Have to assume the values exist, use inner join*/
            INNER JOIN membership ON player.ID = membership.playerID
            INNER JOIN team ON membership.teamID = team.ID
            INNER JOIN {entityName}_result ON 
                {entityName}_result.{entityName}ID = {entityName}.ID
            WHERE
                {entityName}.ID = (?)""",
            (getattr(query, f"{entityName}ID"), )
        )

        cols = [col[0] for col in results_query.description]
        query_results = results_query.fetchall()

        results = []
        for value in query_results:
            data = dict(zip(cols, value))
            results.append(Result.model_validate(data))

        return {"data": results, "detail": "fetch_results_success"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        conn.rollback()
        conn.close()