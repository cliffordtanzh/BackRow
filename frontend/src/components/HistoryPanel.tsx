import { useEffect } from 'react';

import type { Lang } from '../types/Lang';
import type { TeamEvent } from '../types/TeamEvent';

import EventCard from './EventCard';

import './HistoryPanel.css'

type HistoryPanelProps = {
  lang: Lang,
  history: TeamEvent[],
  scrollDown: React.RefObject<HTMLDivElement | null>
}


function HistoryPanel({
  lang,
  history,
  scrollDown,
}: HistoryPanelProps) {

  useEffect(() => {
    scrollDown.current?.scrollIntoView({behavior: "smooth"})
  }, [history])
  
  return (
    <div className='history-panel'>
      {history.map((teamEvent: TeamEvent) => (
        <EventCard 
          lang={lang}
          teamEvent={teamEvent}
          key={`event_${teamEvent.eventID}`}
        />
      ))}
    <div ref={scrollDown}></div>
    </div>
  )
};

export default HistoryPanel;