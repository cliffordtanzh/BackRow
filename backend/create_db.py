import sqlite3

from datatypes import Player, Team


players = [
    Player(playerID=1, playerName="Cliffy", playerNumber=7, teamName="SKVB"),
    Player(playerID=2, playerName="Julian", playerNumber=19, teamName="SKVB"),
    Player(playerID=3, playerName="Yolo", playerNumber=13, teamName="SKVB"),
    Player(playerID=4, playerName="Hong", playerNumber=11, teamName="SKVB"),
]

teams = [
    Team(teamID=1, teamName="SKVB"),
    Team(teamID=2, teamName="Super Happy"),
    Team(teamID=3, teamName="Sarawak Titans"),
]


def instantiate_db(conn):
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE teams (
            teamID      INTEGER PRIMARY KEY,
            teamName    TEXT NOT NULL
        );"""
    )

    cursor.execute("""
        CREATE TABLE players (
            playerID        INTEGER PRIMARY KEY,
            playerName      TEXT NOT NULL,
            playerNumber    INTEGER NOT NULL,
            teamID          INTEGER NOT NULL REFERENCES team(teamID)
        );"""
    )

    cursor.execute("""
        CREATE TABLE pending_verification (
            playerID        INTEGER PRIMARY KEY
            token           TEXT NOT NULL
        )
    """
    )

    for team in teams:
        cursor.execute(
            "INSERT INTO teams VALUES (?, ?)",
            (team.teamID, team.teamName)
        )

    team_query = cursor.execute("SELECT * FROM teams").fetchall()

    for player in players:
        # Player object in pydantic takes in team name, need to convert to
        # team ID before inserting into database

        teamID = [team for team in team_query if team[1]
                  == player.teamName][0][0]
        cursor.execute(
            "INSERT INTO players VALUES (?, ?, ?, ?)",
            (player.playerID, player.playerName, player.playerNumber, teamID)
        )

    conn.commit()


def main():
    conn = sqlite3.connect("database/database.sqlite3")
    cursor = conn.cursor()

    instantiate_db(conn)

    query = cursor.execute("""
        SELECT * FROM players INNER JOIN teams ON players.teamID = teams.teamID
    """)

    print(query.fetchall())


if __name__ == "__main__":
    main()
