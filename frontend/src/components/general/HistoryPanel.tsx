import { useEffect, useRef } from 'react';

import EventCard from '../entry/EventCard';

import Event from '../../types/Event';
import { type History } from '../../types/History';
import { type Lang } from '../../types/Lang';

import './HistoryPanel.css'


type HistoryPanelProps = {
  lang: Lang,
  history: History,
  isPlayerMode: boolean,
  analysisMode?: boolean
}


function HistoryPanel({ lang, history, isPlayerMode, analysisMode = true }: HistoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  
  const events: Event[] = history.events;
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
      {events.map((event: Event) => {
        if (event.pointDelta > 0) {
          pointsWon += 1;
        } else if (event.pointDelta < 0) {
          pointsLost += 1;
        }

        return (
          <EventCard 
            key={`${isPlayerMode}_${event.eventID}`}
            lang={lang}
            event={event}
            entityName={isPlayerMode ? history.playerName : history.teamName}
            pointsWon={pointsWon}
            pointsLost={pointsLost}
          />
        )
    })}
    </div>
  )
};

export default HistoryPanel;