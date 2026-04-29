import enum

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import (
    Column, Integer, String, 
    Boolean, ForeignKey, DateTime,
    Enum
)


class Base(DeclarativeBase):
    pass


class Role(enum.Enum):
    player = "player"
    manager = "manager"
    root = "root"


class Team(Base):
    __tablename__ = "team"
    teamID = Column(Integer, primary_key = True, autoincrement = True)
    teamName = Column(String, nullable = False)


class Player(Base):
    __tablename__ = "player"
    playerID = Column(Integer, primary_key = True, autoincrement = True)
    playerName = Column(String, nullable = False)
    playerNumber = Column(Integer, nullable = False)
    email = Column(String, nullable = False, unique = True)
    passwordHash = Column(String, nullable = False)
    isVerified = Column(Boolean, nullable = False, default = False)


class Verification(Base):
    __tablename__ = "verification"
    playerID = Column(Integer, ForeignKey("player.playerID"), primary_key = True)
    token = Column(String, nullable = False)
    expiry = Column(DateTime, nullable = False)


class Membership(Base):
    __tablename__ = "membership"
    playerID = Column(Integer, ForeignKey("player.playerID"), primary_key = True)
    teamID = Column(Integer, ForeignKey("team.teamID"), nullable = True)
    role = Column(Enum(Role), nullable = False)


class TeamSummary(Base):
    __tablename__ = "team_summary"
    summaryID = Column(Integer, primary_key = True, autoincrement = True)
    gameName = Column(String, nullable = False)
    teamName = Column(String, nullable = False)
    ownTotal = Column(Integer, nullable = False)
    oppTotal = Column(Integer, nullable = False)


class TeamEvent(Base):
    __tablename__ = "team_event"
    eventID = Column(Integer, primary_key = True)
    summaryID = Column(Integer, ForeignKey("team_summary.summaryID"), primary_key = True)
    pointMethod = Column(String, nullable = False)
    ownTotal = Column(Integer, nullable = False)
    oppTotal = Column(Integer, nullable = False)
    