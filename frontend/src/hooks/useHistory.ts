import { useState, useEffect } from 'react';

import EventCreate from '../types/EventCreate';
import { type History } from '../types/History'


export function useHistory(
  itemKey: string, 
  youtubeURL: string, 
  gameName: string
): [
  History,
  React.Dispatch<React.SetStateAction<EventCreate[]>>
] {
  const stored = localStorage.getItem(`${itemKey}Events`);
  const arr = stored ? JSON.parse(stored) : [];

  const storedEvents = arr.map((obj: any) => new EventCreate(
    obj.ID, 
    obj.eventType, 
    obj.pointDelta, 
  ));
  
  const [events, setEvents] = useState<EventCreate[]>([...storedEvents]);

  const playerID = localStorage.getItem('playerID') || 'null'
  const playerName = localStorage.getItem('playerName') || 'null'
  const teamID = localStorage.getItem('teamID') || 'null'
  const teamName = localStorage.getItem('teamName') || 'null'

  const history: History = {
    events: events,
    isPlayerMode: itemKey === 'player',
    playerID: playerID !== 'null' ? Number(playerID) : 0,
    playerName: playerName !== 'null' ? playerName : 'Player',
    teamID: teamID !== 'null' ? Number(teamID) : 0,
    teamName: teamName !== 'null' ? teamName : 'Team',
    youtubeURL: youtubeURL,
    gameName: gameName,
  }

  useEffect(() => {
    localStorage.setItem(`${itemKey}Events`, JSON.stringify(events))
  }, [events])

  return [ history, setEvents ]
}

