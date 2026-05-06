import { useEffect, useRef } from 'react';

import EventCard from './EventCard';

import EventCreate from '../../types/EventCreate';
import { type Event } from '../../types/Event';
import { type Lang } from '../../types/Lang';

import './HistoryPanel.css'


type HistoryPanelProps = {
  lang: Lang,
  events: Event[] | EventCreate[],
  isPlayerMode: boolean,
  teamName: string,
  playerName: string,
  analysisMode?: boolean,
}


function HistoryPanel({ 
  lang, 
  events, 
  isPlayerMode, 
  teamName, 
  playerName, 
  analysisMode = false 
}: HistoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  
  let pointsWon = 0;
  let pointsLost = 0;

  useEffect(() => {
    if (analysisMode) {
      return;
    }

    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight
    }
  }, [events])

  return (
    <div 
      className={`history-panel ${analysisMode ? 'analysis-panel' : ''}`} 
      ref={panelRef}
    >
      {events.map((event: Event | EventCreate) => {
        if (event.pointDelta > 0) {
          pointsWon += 1;
        } else if (event.pointDelta < 0) {
          pointsLost += 1;
        }

        return (
          <EventCard 
            key={`${isPlayerMode}_${event.ID}`}
            lang={lang}
            event={event}
            entityName={isPlayerMode ? playerName : teamName}
            pointsWon={pointsWon}
            pointsLost={pointsLost}
          />
        )
    })}
    </div>
  )
};

export default HistoryPanel;