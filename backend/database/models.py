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
    ID = Column(Integer, primary_key = True, autoincrement = True)
    name = Column(String, nullable = False)


class Player(Base):
    __tablename__ = "player"
    ID = Column(Integer, primary_key = True, autoincrement = True)
    name = Column(String, nullable = False)
    playerNumber = Column(Integer, nullable = False)
    email = Column(String, nullable = False, unique = True)
    passwordHash = Column(String, nullable = False)
    isVerified = Column(Boolean, nullable = False, default = False)


class Verification(Base):
    __tablename__ = "verification"
    playerID = Column(Integer, ForeignKey("player.ID"), primary_key = True)
    token = Column(String, nullable = False)
    expiry = Column(DateTime, nullable = False)


class Membership(Base):
    __tablename__ = "membership"
    playerID = Column(Integer, ForeignKey("player.ID"), primary_key = True)
    teamID = Column(Integer, ForeignKey("team.ID"), nullable = True)
    role = Column(Enum(Role), nullable = False)


class TeamResult(Base):
    __tablename__ = "team_result"
    ID = Column(Integer, primary_key = True, autoincrement = True)
    youtubeURL = Column(String, nullable = False)
    gameName = Column(String, nullable = True)
    teamID = Column(String, ForeignKey("team.ID"), nullable = False)


class TeamEvent(Base):
    __tablename__ = "team_event"
    ID = Column(Integer, primary_key = True)
    resultID = Column(Integer, ForeignKey("team_result.ID"), primary_key = True)
    pointMethod = Column(String, nullable = False)
    pointDelta = Column(Integer, nullable = False)


class PlayerResult(Base):
    __tablename__ = "player_result"
    ID = Column(Integer, primary_key = True, autoincrement = True)
    youtubeURL = Column(String, nullable = False)
    gameName = Column(String, nullable = True)
    playerID = Column(String, ForeignKey("player.ID"), nullable = False)


class PlayerEvent(Base):
    __tablename__ = "player_event"
    ID = Column(Integer, primary_key = True)
    resultID = Column(Integer, ForeignKey("player_result.ID"), primary_key = True)
    eventType = Column(String, nullable = False)
    pointDelta = Column(Integer, nullable = False)