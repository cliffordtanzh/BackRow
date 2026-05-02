import { useEffect, useRef } from 'react';

import EventCard from './EventCard';

import Event from '../../types/Event';
import { type History } from '../../types/History';
import { type Lang } from '../../types/Lang';

import './HistoryPanel.css'


type HistoryPanelProps = {
  lang: Lang,
  results: History,
  isPlayerMode: boolean
}


function HistoryPanel({ lang, results, isPlayerMode }: HistoryPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  
  const events: Event[] = results.events;
  let pointsWon = 0;
  let pointsLost = 0;

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight
    }
  }, [events])
  
  return (
    <div className='history-panel' ref={panelRef}>
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
            entityName={isPlayerMode ? results.playerName : results.teamName}
            pointsWon={pointsWon}
            pointsLost={pointsLost}
          />
        )
    })}
    </div>
  )
};

export default HistoryPanel;