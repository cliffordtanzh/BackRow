import { useState, useEffect } from 'react';

import EventCreate from '../types/EventCreate';
import { type History } from '../types/History'


export function useHistory(itemKey: string, youtubeURL: string, gameName: string): [
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

  const history: History = {
    events: events,
    isPlayerMode: itemKey === 'player',
    playerID: Number(localStorage.getItem('playerID')) || 0,
    playerName: localStorage.getItem('playerName') || 'Player',
    teamID: Number(localStorage.getItem('teamID')) || 0,
    teamName: localStorage.getItem('teamName') || 'Team',
    youtubeURL: youtubeURL,
    gameName: gameName,
  }

  useEffect(() => {
    localStorage.setItem(`${itemKey}Events`, JSON.stringify(events))
  }, [events])

  return [ history, setEvents ]
}

