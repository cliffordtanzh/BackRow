import { useEffect, useRef } from 'react';

import type { Lang } from '../types/Lang';
import type { TeamEvent } from '../types/TeamEvent';

import EventCard from './EventCard';

import './HistoryPanel.css'

type HistoryPanelProps = {
  lang: Lang,
  history: TeamEvent[],
  teamName: string
}


function HistoryPanel({
  lang,
  history,
  teamName,
}: HistoryPanelProps) {

  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (panelRef.current) {
    panelRef.current.scrollTop = panelRef.current.scrollHeight
  }
  }, [history])
  
  return (
    <div className='history-panel' ref={panelRef}>
      {history.map((teamEvent: TeamEvent) => (
        <EventCard 
          lang={lang}
          teamEvent={teamEvent}
          teamName={teamName}
          key={`event_${teamEvent.eventID}`}
        />
      ))}
    </div>
  )
};

export default HistoryPanel;